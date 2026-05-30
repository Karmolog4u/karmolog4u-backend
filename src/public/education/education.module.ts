import { Module } from '@nestjs/common';
import { PublicEducationController } from './education.controller';
import { PublicEducationPrice } from './education.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Course,
  CourseSchema,
} from 'src/admin/education/course/schemas/course.schema';
import {
  Module as ModuleDocument,
  ModuleSchema,
} from 'src/admin/education/module/schemas/module.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Course.name, schema: CourseSchema },
      { name: ModuleDocument.name, schema: ModuleSchema },
    ]),
  ],
  controllers: [PublicEducationController],
  providers: [PublicEducationPrice],
})
export class PublicEducation {}
