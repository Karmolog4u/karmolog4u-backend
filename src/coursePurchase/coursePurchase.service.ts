import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CoursePurchase,
  CoursePurchaseDocument,
} from './schemas/coursePurchase.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreatePurchaseDto } from './dto/create-course-purchase.dto';

@Injectable()
export class CoursePurchaseService {
  constructor(
    @InjectModel(CoursePurchase.name)
    private readonly coursePurchaseModel: Model<CoursePurchaseDocument>,
  ) {}

  async addCoursePurchase(data: CreatePurchaseDto) {
    try {
      const { userId, courseId, ...restData } = data;

      const userObjectId = new Types.ObjectId(userId);
      const courseObjectId = new Types.ObjectId(courseId);

      const coursePurchase = new this.coursePurchaseModel({
        userId: userObjectId,
        courseId: courseObjectId,
        ...restData,
      });
      coursePurchase.save();

      if (!coursePurchase) {
        throw new Error();
      }

      return coursePurchase;
    } catch (error) {
      throw new BadRequestException('Помилка запису в БД');
    }
  }

  // async updateCoursePurchase(purchaseId: string, data: UpdatePurchaseDto) {
  //   try {
  //     const updatedPurchase = await this.coursePurchaseModel.findByIdAndUpdate(
  //       new Types.ObjectId(purchaseId),
  //       { $set: data },
  //       { new: true, runValidators: true },
  //     );

  //     if (!updatedPurchase) {
  //       throw new Error();
  //     }

  //     return updatedPurchase;
  //   } catch (error) {
  //     throw new NotFoundException(`Покупку з ід ${purchaseId} не знайдено`);
  //   }
  // }

  async updateStatusCoursePurchase(
    purchaseId: string,
    status: 'ACTIVE' | 'EXPIRED' | 'BLOCKED',
  ) {
    try {
      const updatedPurchase = await this.coursePurchaseModel.findByIdAndUpdate(
        new Types.ObjectId(purchaseId),
        { $set: { status } },
        { new: true, runValidators: true },
      );

      if (!updatedPurchase) {
        throw new Error();
      }

      return updatedPurchase;
    } catch (error) {
      throw new NotFoundException(`Покупку з ід ${purchaseId} не знайдено`);
    }
  }

  async hasAccess(userId: string, productId: string): Promise<boolean> {
    const purchase = await this.coursePurchaseModel
      .findOne({
        user: userId,
        product: productId,
        status: 'active', // якщо є статус
      })
      .lean();

    return !!purchase;
  }

  async getAccessLevel(
    userId: string,
    productId: string,
  ): Promise<'NONE' | 'PARTIAL' | 'FULL'> {
    const purchase = await this.coursePurchaseModel
      .findOne({ user: userId, product: productId })
      .lean();

    if (!purchase) return 'NONE';
    // return purchase.accessLevel ?? 'FULL';
  }

  async getAchievement(userId: Types.ObjectId) {
    const achievements = await this.coursePurchaseModel.aggregate([
      {
        $match: {
          userId: new Types.ObjectId(userId),
          completed: true,
        },
      },
      {
        $lookup: {
          from: 'courses',
          localField: 'courseId',
          foreignField: '_id',
          as: 'course',
          pipeline: [
            {
              $project: {
                _id: 1,
                cover: 1,
                name: '$name.uk',
                numberOfLessons: {
                  $size: { $ifNull: ['$lessons', []] }, // 👈 fallback якщо lessons = null/нема
                },
              },
            },
          ],
        },
      },
      { $unwind: '$course' },
      { $replaceRoot: { newRoot: '$course' } },
    ]);

    return achievements;
  }

  async getAllCourse(userId: Types.ObjectId) {
    const courses = await this.coursePurchaseModel.aggregate([
      {
        $match: {
          userId: userId,
          status: 'ACTIVE',
        },
      },
      {
        $lookup: {
          from: 'courses', // колекція курсів
          localField: 'courseId',
          foreignField: '_id',
          as: 'course',
        },
      },
      { $unwind: '$course' },
      {
        $project: {
          id: '$course._id',
          _id: 0,
          name: { $ifNull: ['$course.name.uk', '$course.name'] }, // fallback якщо нема uk
          type: '$course.type',
          accessType: '$course.access.type',
          cover: '$course.cover',
          paymentPlan: '$paymentPlan',
          accessEndDate: 1,
          availableTo: 1,
        },
      },
    ]);

    return courses;
  }

  async userHasCourse(userId: string, courseId: string): Promise<boolean> {
    const course = await this.coursePurchaseModel.findOne({ userId, courseId });

    if (!course) {
      return false; // користувач не купував курс
    }
    if (course.accessType === 'PERMANENT') {
      return true; // постійний доступ
    }

    const now = Date.now();

    // Перевіряємо чи вже можна почати курс (доступ відкрито)
    if (course?.accessStartDate.getTime() > now) {
      return false; // доступ ще не почався
    }

    // Перевіряємо чи ще не закінчився доступ
    if (course?.availableTo.getTime() < now) {
      return false; // доступ закінчено
    }

    return true; // курс доступний
  }

  async getCoursePurchaseData(userId: any, courseId: any) {
    const course = await this.coursePurchaseModel.findOne({ userId, courseId });
    return course;
  }
}
