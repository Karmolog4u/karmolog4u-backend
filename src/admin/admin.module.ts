import { Module } from '@nestjs/common';
import { AdminProductModule } from './products/admin-product.module';
import { PromoCodeModule } from './promo-code/promo-code.module';
import { UserModule } from './user/user.module';
import { CourseModule } from './education/course/course.module';
import { ModuleModule } from './education/module/module.module';
import { LessonModule } from './education/lessons/lesson.module';

@Module({
  imports: [
    UserModule,
    AdminProductModule,
    PromoCodeModule,
    CourseModule,
    ModuleModule,
    LessonModule,
  ],
  controllers: [],
  providers: [],
})
export class AdminModule {}
