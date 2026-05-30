import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Course } from 'src/admin/education/course/schemas/course.schema';
import { EducationType } from './enums/education-type.enum';
import { CoursePriceResult } from './dto/coursePriceResult.dto';
import { Module } from 'src/admin/education/module/schemas/module.schema';

@Injectable()
export class PublicEducationPrice {
  constructor(
    @InjectModel(Course.name) private course: Model<Course>,
    @InjectModel(Module.name) private mod: Model<Module>,
  ) {}
  async getEducationPrice(type: EducationType): Promise<CoursePriceResult> {
    const t = type.toUpperCase();
    if (type === EducationType.ADVANCED) {
      const course = await this.getBaseCourseQuery(t).select('price').lean();

      return course ? { price: course.price } : null;
    }
    if (type === EducationType.CONSULTING) {
      const course = await this.getBaseCourseQuery(t)
        .select('price _id practiceInvoice')
        .lean();

      if (!course) return null;

      return {
        price: course.price,
        practicePrice: course.practiceInvoice,
        practice: await this.mod.countDocuments({ course: course._id }),
      };
    }
    if (type === EducationType.SSK) {
      const types = ['SSK_INDEPENDENT', 'SSK_WITH_CURATOR', 'SSK_WITH_SERGIY'];

      const prices = await Promise.all(
        types.map(async (courseType) => {
          const course = await this.getBaseCourseQuery(courseType)
            .select('price')
            .lean();

          return {
            type: courseType,
            price: course?.price ?? null,
          };
        }),
      );

      return { prices };
    }
  }

  private getBaseCourseQuery(type: string) {
    const isSsk = type.includes('SSK');

    return this.course
      .findOne({
        type,
        ...(isSsk ? {} : { 'access.dateStart': { $gt: new Date() } }),
      })
      .sort(isSsk ? { createdAt: -1 } : { 'access.dateStart': 1 });
  }
}
