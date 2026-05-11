import { Module } from '@nestjs/common';
import { AdminProductModule } from './products/admin-product.module';
import { PromoCodeModule } from './promo-code/promo-code.module';
import { UserModule } from './user/user.module';
import { CourseModule } from './education/course/course.module';
import { ModuleModule } from './education/module/module.module';
import { LessonModule } from './education/lessons/lesson.module';
import { CoursePurchaseModule } from './coursePurchase/coursePurchase.module';
import { ProductPurchaseModule } from './productPurchase/productPurchase.module';
import { EventsModule } from './events/events.module';

@Module({
  imports: [
    UserModule,
    AdminProductModule,
    PromoCodeModule,
    CourseModule,
    ModuleModule,
    LessonModule,
    CoursePurchaseModule,
    ProductPurchaseModule,
    EventsModule,
  ],
  controllers: [],
  providers: [],
})
export class AdminModule {}
