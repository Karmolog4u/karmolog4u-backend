import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as crypto from 'crypto';
import { Types } from 'mongoose';
import {
  PaymentType,
  Purchase,
  PurchaseDocument,
  PurchaseStatus,
} from './schemas/purchase.schema';
import { ProductService } from 'src/products/product.service';
import { DiscountService } from 'src/admin/products/discount/discount.service';
import {
  ProductPurchase,
  ProductPurchaseDocument,
} from 'src/productPurchase/schemas/productPurchase.schema';
import { User } from 'src/user/schemas/user.schema';
import { ConfigService } from '@nestjs/config';
import { PromoCodeService } from 'src/admin/promo-code/promo-code.service';
import { CourseService } from 'src/user/education/course.service';
import { CoursePurchaseService } from 'src/coursePurchase/coursePurchase.service';
import { UserEntity } from 'src/user/dto/user-entity.dto';
import { PaymentStatus } from './emun/payment-status.enum';
// import { RedisPubSubService } from 'src/redis/redis-pubsub.service';
import { Observable } from 'rxjs';
import { v4 as uuid } from 'uuid';
import {
  advPercentage,
  advTotalPayments,
  consultingPercentage,
  consultingTotalPayments,
} from 'src/common/helper/consts';

interface SignatureDataInterface {
  orderReference: string;
  orderDate: number;
  amount: number;
  currency: string;
  productName: string[];
  productPrice: number[];
  productCount: number[];
}

@Injectable()
export class PaymentsService {
  private merchantAccount: string;
  private merchantSecretKey: string;
  private returnUrl: string;
  private serviceUrl: string;
  private serviceEdUrl: string;
  private currency: string;
  private merchantDomainName: string;
  constructor(
    @InjectModel(Purchase.name)
    private purchaseModel: Model<PurchaseDocument>,
    @InjectModel(ProductPurchase.name)
    private readonly productPurchaseModel: Model<ProductPurchaseDocument>,
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly productService: ProductService,
    private readonly discountService: DiscountService,
    private readonly promoCodeService: PromoCodeService,
    private readonly courseService: CourseService,
    private readonly coursePurchaseService: CoursePurchaseService,
    // private readonly redis: RedisPubSubService,
    private readonly configService: ConfigService,
  ) {
    this.merchantAccount = this.configService.getOrThrow('WFP_MERCHANT');
    this.merchantSecretKey = this.configService.getOrThrow('WFP_SECRET');
    this.returnUrl = this.configService.getOrThrow('WFP_RETURN_URL');
    this.serviceUrl = this.configService.getOrThrow('WFP_CALLBACK_PRODUCT_URL');
    this.serviceEdUrl = this.configService.getOrThrow(
      'WFP_CALLBACK_EDUCATION_URL',
    );
    this.currency = this.configService.get('CURRENCY') ?? 'EUR';
    this.merchantDomainName = this.configService.getOrThrow(
      'WFP_MERCHANT_DOMAIN_NAME',
    );
  }

  // if user email not equal to dto.email do by email, if user email equal to dto.email do by userId
  // add promocode
  async createPayment(dto: any, user?: any) {
    // find product

    const product = await this.productService.getProductDetails(dto.itemId);
    if (!product) {
      throw new BadRequestException('Продукт не знайдено');
    }

    let amount = product.price;

    // check for active discount
    const discount = await this.discountService.findDiscount({
      refId: product._id,
    });

    const now = Date.now();

    const isUseDiscount =
      Boolean(discount) &&
      new Date(discount.start).getTime() <= now &&
      now <= new Date(discount.expiredAt).getTime();

    if (isUseDiscount) {
      amount = product.price - (product.price * discount.discount) / 100;
    }

    const promocode = dto.promocode;
    if (promocode) {
      const validPromocode = await this.promoCodeService.validatePromoCode(
        promocode,
        product._id,
      );
      if (validPromocode) {
        amount = amount - (amount * validPromocode.promoDiscount) / 100;
      } else {
        throw new BadRequestException('Некоректний промокод');
      }
    }
    const orderReference = `order_${uuid()}`;

    //check type of product and set targetModule
    const productType = await this.productService.getProductTypeById(
      dto.itemId,
    );

    const returnProductUrl = () => {
      productType === 'guide'
        ? `${this.returnUrl}guides-and-books`
        : productType === 'webinar'
        ? `${this.returnUrl}courses`
        : `${this.returnUrl}meditations`;
    };

    if (!productType) {
      throw new BadRequestException('Продукта не знайдено');
    }

    // if user is authenticated, we can link the purchase to their account

    let purchase: PurchaseDocument;

    // if user email not equal to dto.email do by email, if user email equal to dto.email do by userId
    if (user && user.email === dto.email) {
      // check if user already has an active purchase for this product
      await this.checkExistingPurchase(dto);

      //check if user has productPurchase for this product
      const productPurchase = await this.productPurchaseModel.findOne({
        userId: user._id,
        productId: product._id,
      });
      if (productPurchase) {
        throw new BadRequestException(
          'Ви вже придбали цей товар. Будь ласка, перевірте свої покупки.',
        );
      }

      purchase = await this.purchaseModel.create({
        orderReference,
        productName: product.name.uk,
        productId: product._id,
        productPrice: product.price,
        productType: productType,
        paymentType: PaymentType.FULL,
        currency: this.currency,
        userId: user._id,
        clientEmail: user.email,
        clientPhone: user.phone,
        amount,
      });
    } else {
      // guest purchase - we won't link it to a user account, but we can still store email and phone for contact

      // check if user has account with this email
      await this.checkExistingUser(dto);
      // check if user already has an active purchase for this product
      await this.checkExistingPurchase(dto);

      purchase = await this.purchaseModel.create({
        orderReference,
        productName: product.name.uk,
        productId: product._id,
        productPrice: product.price,
        productType: productType,
        paymentType: PaymentType.FULL,
        amount,
        currency: this.currency,
        clientEmail: dto.email,
        clientPhone: dto.phone,
      });
    }

    const orderDate = Math.floor(Date.now() / 1000);

    const signature = this.generateSignature({
      orderReference,
      orderDate,
      amount,
      currency: this.currency,
      productName: [purchase.productName],
      productPrice: [purchase.productPrice],
      productCount: [1],
    });

    return {
      orderReference,
      status: PaymentStatus.Pending,
      paymentUrl: 'https://secure.wayforpay.com/pay',
      formData: {
        merchantAccount: this.merchantAccount,
        merchantAuthType: 'SimpleSignature',
        merchantSignature: signature,
        merchantDomainName: this.merchantDomainName,
        orderReference,
        orderDate,
        amount,
        currency: purchase.currency,
        productName: [purchase.productName],
        productPrice: [purchase.productPrice],
        productCount: [1],
        returnUrl: returnProductUrl(),
        serviceUrl: this.serviceUrl,
      },
    };
  }

  async handleProductCallback(data: any) {
    const purchase = await this.purchaseModel
      .findOne({
        orderReference: data.orderReference,
      })
      .exec();

    console.log('purchase: ', purchase);

    console.log('data: ', data);

    if (!purchase) {
      throw new BadRequestException('Order not found');
    }

    if (purchase.processed) {
      return this.buildAcceptResponse(data.orderReference);
    }

    if (!this.verifyCallbackSignature(data)) {
      throw new BadRequestException('Invalid signature');
    }

    purchase.transactionStatus = data.transactionStatus;
    purchase.rawResponse = data;

    console.log('purchase2: ', purchase);

    switch (data.transactionStatus) {
      case 'Approved':
        purchase.status = PurchaseStatus.APPROVED;
        break;

      case 'Declined':
        purchase.status = PurchaseStatus.DECLINED;
        break;
    }

    if (purchase.status === PurchaseStatus.APPROVED) {
      await this.processBusinessLogic(purchase);
    }

    purchase.processed = true;
    await purchase.save();

    console.log('purchase3: ', purchase);

    console.log('response: ', this.buildAcceptResponse(data.orderReference));

    return this.buildAcceptResponse(data.orderReference);
  }

  async createCoursePayment(courseId: string, user: UserEntity) {
    const { id, course, coursePurchase } = await this.validateCoursePayment(
      courseId,
      user,
    );

    const { price } = coursePurchase;

    // check if user already has an active purchase for this course
    await this.checkCoursePurchase({ email: user.email, itemId: id });

    const orderReference = `order_${Date.now()}`;

    //check type of product and set targetModule
    const productType = 'course';

    const { paymentType, amount } = this.calculatePaymentData(
      price,
      course.type,
    );

    const purchase: PurchaseDocument = await this.purchaseModel.create({
      orderReference,
      productName: course.name,
      productId: course._id,
      productPrice: coursePurchase.price,
      productType,
      paymentType,
      amount,
      currency: this.currency,
      userId: user._id,
      clientEmail: user.email,
      clientPhone: user.mobPhone,
    });

    const orderDate = Math.floor(Date.now() / 1000);

    const signature = this.generateSignature({
      orderReference,
      orderDate,
      amount,
      currency: this.currency,
      productName: [purchase.productName],
      productPrice: [purchase.productPrice],
      productCount: [1],
    });

    return {
      orderReference,
      status: PaymentStatus.Pending,
      paymentUrl: 'https://secure.wayforpay.com/pay',
      formData: {
        merchantAccount: this.merchantAccount,
        merchantAuthType: 'SimpleSignature',
        merchantSignature: signature,
        merchantDomainName: this.merchantDomainName,
        orderReference,
        orderDate,
        amount,
        currency: this.currency,
        productName: [purchase.productName],
        productPrice: [purchase.productPrice],
        productCount: [1],
        returnUrl: `${this.returnUrl}cabinet/dashboard/user/education`,
        serviceUrl: this.serviceUrl,
      },
    };
  }

  async getStatus(orderReference: string) {
    // TODO: брати з БД
    const payment = await this.purchaseModel.findOne({ orderReference });

    return {
      orderReference,
      status: payment ? payment.status : 'not_found',
    };
  }

  // sse(orderReference: string): Observable<MessageEvent> {
  //   return new Observable<MessageEvent>((observer) => {
  //     const channel = `payment:${orderReference}`;
  //     let unsubscribe: (() => Promise<void>) | null = null;

  //     this.redis
  //       .subscribe(channel, (payload) => {
  //         observer.next({
  //           data: payload,
  //         } as MessageEvent);

  //         if (payload.status !== PaymentStatus.Pending) {
  //           observer.complete();
  //         }
  //       })
  //       .then((unsub) => {
  //         unsubscribe = unsub;
  //       });

  //     const heartbeat = setInterval(() => {
  //       observer.next({
  //         data: {
  //           type: 'ping',
  //           time: Date.now(),
  //         },
  //       } as MessageEvent);
  //     }, 15000);

  //     return () => {
  //       clearInterval(heartbeat);

  //       if (unsubscribe) {
  //         unsubscribe();
  //       }
  //     };
  //   });
  // }

  private verifyCallbackSignature(body: any): boolean {
    const signatureString = [
      body.merchantAccount,
      body.orderReference,
      body.amount,
      body.currency,
      body.authCode,
      body.cardPan,
      body.transactionStatus,
      body.reasonCode,
    ].join(';');

    const expectedSignature = crypto
      .createHmac('md5', this.merchantSecretKey)
      .update(signatureString)
      .digest('hex');

    return expectedSignature === body.merchantSignature;
  }

  private buildAcceptResponse(orderReference: string) {
    const time = Math.floor(Date.now() / 1000);

    return {
      orderReference,
      status: 'accept',
      time,
      signature: this.generateCallbackResponseSignature(
        orderReference,
        'accept',
        time,
      ),
    };
  }

  private generateSignature(data: SignatureDataInterface): string {
    const parts = [
      this.merchantAccount,
      this.merchantDomainName,
      data.orderReference,
      data.orderDate,
      data.amount,
      data.currency,
    ];

    data.productName.forEach((name, index) => {
      parts.push(
        name,
        String(data.productCount[index]),
        String(data.productPrice[index]),
      );
    });

    return crypto
      .createHmac('md5', this.merchantSecretKey)
      .update(parts.join(';'))
      .digest('hex');
  }

  private generateCallbackResponseSignature(
    orderReference: string,
    status: string,
    time: number,
  ): string {
    const signatureString = [
      this.merchantAccount,
      orderReference,
      status,
      time,
    ].join(';');

    return crypto
      .createHmac('md5', this.merchantSecretKey)
      .update(signatureString)
      .digest('hex');
  }

  private successResponse(orderReference: string) {
    return {
      orderReference,
      status: 'accept',
      time: Date.now(),
    };
  }

  private async processBusinessLogic(purchase: PurchaseDocument) {
    const existingUser = await this.userModel.findOne({
      email: purchase.clientEmail,
    });

    if (!existingUser) {
      // optional: email fallback
      console.log('sent email');

      return;
    }

    await this.productPurchaseModel.create({
      userId: existingUser._id,
      productId: purchase.productId,
      targetModule: purchase.productType,
    });
  }

  private async checkExistingUser(dto: any) {
    const existingUser = await this.userModel.findOne({ email: dto.email });
    if (existingUser) {
      throw new BadRequestException(
        'Обліковий запис із цією електронною адресою вже існує. Будь ласка, увійдіть, щоб придбати цей товар.',
      );
    }
  }

  private async checkExistingPurchase(dto: any) {
    const existingPurchase = await this.purchaseModel.findOne({
      clientEmail: dto.email,
      productId: dto.itemId,
    });

    if (existingPurchase) {
      switch (existingPurchase.status) {
        case PurchaseStatus.PENDING:
          throw new BadRequestException(
            'Для цієї електронної адреси та продукту вже є покупка, що очікує на розгляд. Будь ласка, завершіть її, перш ніж створювати нову.',
          );
        case PurchaseStatus.DECLINED:
          throw new BadRequestException(
            'Вашу попередню покупку цього товару було відхилено. Будь ласка, спробуйте ще раз або зверніться до служби підтримки.',
          );
        case PurchaseStatus.APPROVED:
          throw new BadRequestException(
            'Ви вже придбали цей товар, використовуючи цю електронну адресу. Будь ласка, перевірте свої покупки.',
          );
      }
    }
  }

  private async validateCoursePayment(courseId: string, user: UserEntity) {
    if (!Types.ObjectId.isValid(courseId)) {
      throw new BadRequestException('Invalid courseId');
    }

    const id = new Types.ObjectId(courseId);

    const course = await this.courseService.getCourseData(id);

    if (!course) {
      throw new BadRequestException('Курс не знайдено');
    }

    const coursePurchase =
      await this.coursePurchaseService.getCoursePurchaseData(user._id, id);

    if (!coursePurchase) {
      throw new BadRequestException('У вас немає такого курсу');
    }

    if (coursePurchase.paymentPlan === 'FULL') {
      throw new BadRequestException('Ви уже маєте повний доступ');
    }

    return {
      id,
      course,
      coursePurchase,
    };
  }

  private calculatePaymentData(price: number, type: string) {
    const defaultConfig = {
      amount: price / 2,
      paymentType: PaymentType.FULL,
    };

    const paymentConfig = {
      CONSULTING: {
        amount:
          (price - price * consultingPercentage) / consultingTotalPayments,
        paymentType: PaymentType.MONTHLY,
      },
      ADVANCED: {
        amount: (price - price * advPercentage) / advTotalPayments,
        paymentType: PaymentType.MONTHLY,
      },
    };

    return paymentConfig[type] || defaultConfig;
  }

  private async checkCoursePurchase(dto: {
    email: string;
    itemId: Types.ObjectId;
  }) {
    const existingPurchase = await this.purchaseModel.findOne({
      clientEmail: dto.email,
      productId: dto.itemId,
    });

    if (existingPurchase) {
      switch (existingPurchase.status) {
        case PurchaseStatus.PENDING:
          throw new BadRequestException(
            'There is already a pending purchase for this email and product. Please complete it before creating a new one.',
          );
        case PurchaseStatus.APPROVED:
          throw new BadRequestException(
            'You have already purchased this product with this email. Please check your purchases.',
          );
      }
    }
  }
}
