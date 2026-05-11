import { CourseModule as Course } from 'src/admin/education/course/course.module';
import { CourseController } from './course.controller';
import { CourseService } from './course.service';
import { Module } from '@nestjs/common';
import { CoursePurchaseModule } from 'src/coursePurchase/coursePurchase.module';
import { LessonModule } from 'src/admin/education/lessons/lesson.module';
import { ModuleModule } from 'src/admin/education/module/module.module';
import { MailModule } from 'src/mail/mail.module';
import { FilesModule } from 'src/files/files.module';

@Module({
  imports: [
    Course,
    CoursePurchaseModule,
    LessonModule,
    ModuleModule,
    MailModule,
    FilesModule,
  ],
  controllers: [CourseController],
  providers: [CourseService],
  exports: [CourseService],
})
export class CourseModule {}
