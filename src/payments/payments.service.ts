import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
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
import {
  advPercentage,
  advTotalPayments,
  consultingPercentage,
  consultingTotalPayments,
} from 'src/common/helper/consts';
import { MailService } from 'src/mail/mail.service';
import * as path from 'path';
import { existsSync } from 'fs';
import { ModuleService } from 'src/admin/education/module/module.service';

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
  private readonly logger = new Logger(PaymentsService.name);

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
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
    private readonly modulesService: ModuleService,
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
    const orderReference = `order_${now}_${product._id}_${product.price}`;

    //check type of product and set targetModule
    const noFormattedProductType = await this.productService.getProductTypeById(
      dto.itemId,
    );

    if (!noFormattedProductType) {
      throw new BadRequestException('Продукта не знайдено');
    }

    const productTypeMap = {
      meditation: 'Meditations',
      webinar: 'Webinars',
      guide: 'GuidesAndBooks',
    } as const;

    const productType = noFormattedProductType
      ? productTypeMap[noFormattedProductType]
      : null;

    const returnProductUrl = () => {
      noFormattedProductType === 'guide'
        ? `${this.returnUrl}guides-and-books`
        : noFormattedProductType === 'webinar'
        ? `${this.returnUrl}courses`
        : `${this.returnUrl}meditations`;
    };

    const existingUser = await this.userModel.findOne({ email: dto.email });
    console.log('user:', existingUser);
    await this.checkExistingPurchase(dto);

    // if user email not equal to dto.email do by email, if user email equal to dto.email do by userId
    if (existingUser) {
      //check if user has productPurchase for this product
      const productPurchase = await this.productPurchaseModel.findOne({
        userId: existingUser._id,
        productId: product._id,
      });
      if (productPurchase) {
        throw new BadRequestException(
          'Ви вже придбали цей товар. Будь ласка, перевірте свої покупки.',
        );
      }
    }

    const purchase: PurchaseDocument = await this.purchaseModel.create({
      orderReference,
      productName: product.name.uk,
      productId: product._id,
      productPrice: product.price,
      productType: productType,
      paymentType: PaymentType.FULL,
      currency: this.currency,
      userId: existingUser?._id ?? null,
      clientEmail: dto.email,
      clientPhone: dto.phone,
      amount,
    });

    const orderDate = Math.floor(now / 1000);

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

    if (!purchase) {
      throw new BadRequestException('Order not found');
    }

    const status =
      purchase.status === PurchaseStatus.APPROVED ? 'accept' : 'reject';

    if (purchase.processed) {
      return this.buildCallbackResponse(data.orderReference, status);
    }

    if (!this.verifyCallbackSignature(data)) {
      throw new BadRequestException('Invalid signature');
    }

    purchase.rawResponse = data;

    switch (data.transactionStatus) {
      case 'Approved':
        purchase.status = PurchaseStatus.APPROVED;
        break;

      case 'Declined':
        purchase.status = PurchaseStatus.DECLINED;
        break;

      default:
        purchase.status = PurchaseStatus.DECLINED;
        break;
    }

    if (purchase.status === PurchaseStatus.APPROVED) {
      await this.processBusinessLogic(purchase);
    }

    purchase.processed = true;
    purchase.expiresAt = undefined;

    await purchase.save();

    return this.buildCallbackResponse(data.orderReference, status);
  }

  async createCoursePayment(courseId: string, user: UserEntity) {
    const { id, course, coursePurchase } = await this.validateCoursePayment(
      courseId,
      user,
    );

    const { price } = coursePurchase;
    const type = 'course';
    // check if user already has an active purchase for this course
    await this.checkCoursePurchase({
      email: user.email,
      itemId: id,
      type,
    });

    const now = Date.now();

    const orderReference = `order_${now}_${id}_${coursePurchase.price}_${
      coursePurchase.numberOfPayments + 1
    }`;

    //check type of product and set targetModule
    const productType = type;

    const { paymentType, amount } = this.calculatePaymentData(
      price,
      course.type,
    );

    const purchase: PurchaseDocument = await this.purchaseModel.create({
      orderReference,
      productName: course.name,
      productId: course._id,
      productPrice: price,
      productType,
      paymentType,
      amount,
      currency: this.currency,
      userId: user._id,
      clientEmail: user.email,
      clientPhone: user.mobPhone,
    });

    const orderDate = Math.floor(now / 1000);

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
        serviceUrl: this.serviceEdUrl,
      },
    };
  }

  async handleEducationCallback(data: any) {
    const { orderReference, transactionStatus } = data;
    const purchase = await this.purchaseModel
      .findOne({
        orderReference: orderReference,
      })
      .exec();

    if (!purchase) {
      return this.buildCallbackResponse(orderReference, 'reject');
    }

    if (!this.verifyCallbackSignature(data)) {
      return this.buildCallbackResponse(orderReference, 'reject');
    }

    if (purchase.processed && purchase.status === PurchaseStatus.APPROVED) {
      return this.buildCallbackResponse(orderReference, 'accept');
    }

    const previousStatus = purchase.status;
    purchase.rawResponse = data;

    switch (transactionStatus) {
      case 'Approved':
        purchase.status = PurchaseStatus.APPROVED;
        break;

      default:
        purchase.status = PurchaseStatus.DECLINED;
        break;
    }
    const isFirstApproval =
      previousStatus === PurchaseStatus.PENDING &&
      purchase.status === PurchaseStatus.APPROVED;

    if (isFirstApproval && purchase.productType === 'course') {
      try {
        await this.processEducationBusinessLogic(purchase);
        purchase.expiresAt = undefined;
      } catch (error) {
        this.logger.error('Business logic failed', error);
      }
    }

    if (isFirstApproval && purchase.productType === 'practice') {
      try {
        await this.updateNumberOfPractices(purchase);
      } catch (error) {
        this.logger.error('Business logic failed', error);
      }
    }
    purchase.processed = true;

    await purchase.save();
    const responseStatus =
      purchase.status === PurchaseStatus.APPROVED ? 'accept' : 'reject';
    return this.buildCallbackResponse(orderReference, responseStatus);
  }

  async createPracticeInvoice(courseId: string, user: UserEntity) {
    const { id, course, coursePurchase } = await this.validateCoursePayment(
      courseId,
      user,
    );
    await this.validatePracticeModules(coursePurchase, String(id));
    const { practiceInvoice } = course;

    const type = 'practice';
    // check if user already has an active purchase for this course
    await this.checkCoursePurchase({
      email: user.email,
      itemId: id,
      type,
    });
    const now = Date.now();
    const orderReference = `order_${now}_${id}_${practiceInvoice}_${
      coursePurchase.numberOfPractices + 1
    }`;

    //check type of product and set targetModule
    const productType = type;

    const purchase: PurchaseDocument = await this.purchaseModel.create({
      orderReference,
      productName: course.name,
      productId: course._id,
      productPrice: practiceInvoice,
      productType,
      paymentType: 'MONTHLY',
      amount: practiceInvoice,
      currency: this.currency,
      userId: user._id,
      clientEmail: user.email,
      clientPhone: user.mobPhone,
    });

    const orderDate = Math.floor(now / 1000);

    const signature = this.generateSignature({
      orderReference,
      orderDate,
      amount: practiceInvoice,
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
        amount: practiceInvoice,
        currency: this.currency,
        productName: [purchase.productName],
        productPrice: [purchase.productPrice],
        productCount: [1],
        returnUrl: `${this.returnUrl}cabinet/dashboard/user/user/course/${
          course.type === 'CONSULTING' ? 'consulting' : 'advanced'
        }/${id}`,
        serviceUrl: this.serviceEdUrl,
      },
    };
  }

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

  private buildCallbackResponse(
    orderReference: string,
    status: 'accept' | 'reject',
  ) {
    const time = Math.floor(Date.now() / 1000);

    return {
      orderReference,
      status,
      time,
      signature: this.generateCallbackResponseSignature(
        orderReference,
        status,
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

  private async checkExistingPurchase(dto: any) {
    const existingPurchase = await this.purchaseModel.findOne({
      clientEmail: dto.email,
      productId: dto.itemId,
    });

    if (!existingPurchase) {
      return;
    }
    if (existingPurchase.status === PurchaseStatus.PENDING) {
      throw new BadRequestException(
        'Для цієї електронної адреси та продукту вже є покупка, що очікує на розгляд. Будь ласка, завершіть її, перш ніж створювати нову.',
      );
    }
    if (existingPurchase.status === PurchaseStatus.APPROVED) {
      throw new BadRequestException(
        'Ви вже придбали цей товар, використовуючи цю електронну адресу. Будь ласка, перевірте свої покупки.',
      );
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

  private async validatePracticeModules(
    coursePurchase: { numberOfPractices: number },
    id: string,
  ) {
    const modulesNumber = await this.modulesService.getPractices(id);
    if (modulesNumber === 0) {
      throw new BadRequestException('Немає доступних практик');
    }
    if (modulesNumber === coursePurchase.numberOfPractices) {
      throw new BadRequestException('Всі доступні практики в же куплені');
    }
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
    type: string;
  }) {
    const pendingPurchase = await this.purchaseModel.findOne({
      clientEmail: dto.email,
      productId: dto.itemId,
      status: PurchaseStatus.PENDING,
      productType: dto.type,
    });

    if (pendingPurchase) {
      throw new BadRequestException(
        'Для цього продукту вже існує незавершена оплата.',
      );
    }
  }

  private async processBusinessLogic(purchase: PurchaseDocument) {
    const existingUser = await this.userModel.findOne({
      email: purchase.clientEmail,
    });

    if (!existingUser) {
      const product = await this.productService.getProductDetails(
        purchase.productId.toString(),
      );
      if (purchase.productType === 'GuidesAndBooks') {
        const guide = product as any;
        const STORAGE_ROOT = path.join(process.cwd(), '..', 'storage');
        const filePath = path.join(STORAGE_ROOT, guide.file.path);

        if (!existsSync(filePath)) {
          throw new Error(`File not found: ${filePath}`);
        }

        await this.mailService.sendEmail(
          purchase.clientEmail,
          purchase.productName,
          'guidesAndBooksPurchase',
          { productName: purchase.productName },
          {
            filename: guide.file.originalName,
            path: filePath,
          },
        );

        return;
      }
      await this.mailService.sendEmail(
        purchase.clientEmail,
        purchase.productName,
        'purchaseProductNoEmail',
        {
          videoUrl: `https://youtube.com/watch?v=${product.video}`,
        },
      );

      return;
    }

    await this.productPurchaseModel.create({
      userId: existingUser._id,
      productId: purchase.productId,
      targetModule: purchase.productType,
    });
  }
  private async processEducationBusinessLogic(purchase: PurchaseDocument) {
    const sskList = ['SSK_INDEPENDENT', 'SSK_WITH_CURATOR', 'SSK_WITH_SERGIY'];
    if (!purchase.userId) {
      throw new BadRequestException('Користувача не знайдено');
    }
    const coursePurchase =
      await this.coursePurchaseService.getCoursePurchaseData(
        purchase.userId,
        purchase.productId,
      );
    if (!coursePurchase) {
      throw new NotFoundException('Курс не знайдено');
    }
    const course = await this.courseService.getCourseDetail(
      purchase.userId,
      purchase.productId,
    );
    if (sskList.includes(course.type)) {
      const lessons = await this.courseService.getLessonsSSK(
        purchase.userId,
        purchase.productId,
      );
      coursePurchase.paymentPlan = 'FULL';
      coursePurchase.lessonsUnlocked = lessons.map((l) => l.id);

      await coursePurchase.save();
      return;
    }

    const paymentPlansMap = {
      CONSULTING: consultingTotalPayments,
      ADVANCED: advTotalPayments,
    };
    const totalPayments = paymentPlansMap[course.type];
    if (totalPayments) {
      coursePurchase.numberOfPayments += 1;

      const isLastPayment = coursePurchase.numberOfPayments === totalPayments;

      const nextMonth = new Date(coursePurchase.availableTo);

      nextMonth.setMonth(nextMonth.getMonth() + 1);

      coursePurchase.availableTo = isLastPayment
        ? coursePurchase.accessEndDate
        : nextMonth;

      if (isLastPayment) {
        coursePurchase.paymentPlan = 'FULL';
      }

      await coursePurchase.save();
    }
  }

  private async updateNumberOfPractices(purchase: PurchaseDocument) {
    const coursePurchase =
      await this.coursePurchaseService.getCoursePurchaseData(
        purchase.userId,
        purchase.productId,
      );
    if (!coursePurchase) {
      throw new NotFoundException('Курс не знайдено');
    }
    coursePurchase.numberOfPractices += 1;
    await coursePurchase.save();
  }
}
