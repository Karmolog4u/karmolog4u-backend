import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Purchase, PurchaseSchema } from './schemas/purchase.schema';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { ProductModule } from 'src/products/product.module';
import { ProductPurchaseModule } from 'src/productPurchase/productPurchase.module';
import { UserModule } from 'src/user/user.module';
import { DiscountModule } from 'src/admin/products/discount/discount.module';
import { PromoCodeModule } from 'src/admin/promo-code/promo-code.module';
import { CourseModule } from 'src/user/education/course.module';
import { CoursePurchaseModule } from 'src/coursePurchase/coursePurchase.module';
import { MailModule } from 'src/mail/mail.module';
import { ModuleModule } from 'src/admin/education/module/module.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Purchase.name, schema: PurchaseSchema },
    ]),
    ProductModule,
    ProductPurchaseModule,
    UserModule,
    DiscountModule,
    PromoCodeModule,
    CourseModule,
    CoursePurchaseModule,
    MailModule,
    ModuleModule,
  ],
  providers: [PaymentsService],
  controllers: [PaymentsController],
  exports: [PaymentsService],
})
export class PaymentsModule {}
