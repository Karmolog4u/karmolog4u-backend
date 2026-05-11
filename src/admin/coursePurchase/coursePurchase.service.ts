import {
  BadRequestException,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  CoursePurchase,
  CoursePurchaseDocument,
} from 'src/coursePurchase/schemas/coursePurchase.schema';
import { UpdatePurchaseDto } from './dto/update-course-purchase.dto';
import { Course } from '../education/course/schemas/course.schema';
import { AddCoursePurchaseDto } from './dto/add-course-purchase.dto';
import { Lesson } from '../education/lessons/schemas/lesson.schema';
import { Module } from '../education/module/schemas/module.schema';
import { UpdatePurchaseAccess } from './interfaces/updatePurchaseAccess.interface';

@Injectable()
export class CoursePurchaseService {
  constructor(
    @InjectModel(CoursePurchase.name)
    private readonly coursePurchaseModel: Model<CoursePurchaseDocument>,
    @InjectModel(Course.name) private courseModel: Model<Course>,
    @InjectModel(Lesson.name) private lessonModel: Model<Lesson>,
    @InjectModel(Module.name) private moduleModel: Model<Module>,
  ) {}

  async addCoursePurchase(
    userId: string,
    courseId: string,
    paymentPlan: 'FULL' | 'PARTIAL' | 'INSTALLMENT',
  ) {
    try {
      const purchase = await this.coursePurchaseModel.findOne({
        userId: new Types.ObjectId(userId),
        courseId: new Types.ObjectId(courseId),
      });
      if (purchase) {
        throw new BadRequestException('користувач має таку покупку!');
      }

      const userObjectId = new Types.ObjectId(userId);

      //get course from db
      const course = await this.courseModel.findById(courseId);
      if (!course) {
        throw new NotFoundException('Курс не знайдено');
      }

      // create obj data to record
      const Data: Record<string, any> = {
        userId: userObjectId,
        courseId: courseId,
        status: 'ACTIVE',
        paymentPlan,
      };

      Data.accessType = course.access.type;
      if (Data.accessType === 'FOR_PERIOD') {
        Data.accessStartDate = new Date().toISOString();
        const dateNowPlusMonths = new Date();
        dateNowPlusMonths.setMonth(
          dateNowPlusMonths.getMonth() + +course.access.months,
        );
        Data.accessEndDate = dateNowPlusMonths;
      }

      if (Data.accessType === 'TO_DATE') {
        Data.accessStartDate = course.access.dateStart;
        Data.accessEndDate = course.access.dateEnd;
      }

      if (Data.accessType === 'PERMANENT') {
        const Now = Date.now();
        const plus100Years = new Date(Now);
        plus100Years.setFullYear(plus100Years.getFullYear() + 100);
        Data.accessStartDate = Now;
        Data.accessEndDate = plus100Years;
        Data.availableTo = plus100Years;
      }

      if (
        course.type === 'SSK_INDEPENDENT' ||
        course.type === 'SSK_WITH_CURATOR' ||
        course.type === 'SSK_WITH_SERGIY'
      ) {
        Data.availableTo = Data.accessEndDate;
      }

      if (
        (course.type === 'CONSULTING' || course.type === 'ADVANCED') &&
        Data.paymentPlan === 'FULL'
      ) {
        Data.availableTo = course.access.dateEnd;
      }
      if (
        (course.type === 'CONSULTING' || course.type === 'ADVANCED') &&
        Data.paymentPlan === 'INSTALLMENT'
      ) {
        const dateNowPlusMonths = new Date();
        dateNowPlusMonths.setMonth(dateNowPlusMonths.getMonth() + 1);
        Data.availableTo = dateNowPlusMonths;
      }

      if (
        course.type === 'SSK_INDEPENDENT' ||
        course.type === 'SSK_WITH_CURATOR' ||
        course.type === 'SSK_WITH_SERGIY'
      ) {
        const lessons = await this.lessonModel
          .find({
            targetId: course._id,
            targetModel: 'Course',
          })
          .sort({ createdAt: 1 })
          .select('_id');

        if (Data.paymentPlan === 'PARTIAL') {
          const splitIndex = Math.floor(lessons.length / 2);
          const half = lessons.slice(0, splitIndex);
          Data.lessonsUnlocked = half;
        } else if (Data.paymentPlan === 'FULL') {
          Data.lessonsUnlocked = lessons;
        }
      }

      const coursePurchase = new this.coursePurchaseModel(Data);
      coursePurchase.save();

      if (!coursePurchase) {
        throw new BadRequestException('Помилка створення покупки');
      }

      return { message: 'success' };
    } catch (error) {
      throw new HttpException(
        {
          status: error.status,
          message: error.response.message,
          error: error.response.error,
        },
        error.status,
        {
          cause: error,
        },
      );
    }
  }

  async addCoursePurchases(userId: string, data: AddCoursePurchaseDto) {
    const promises = data.courses.map(
      (i) => this.addCoursePurchase(userId, i.courseId, i.paymentPlan), // твій існуючий метод
    );

    return await Promise.all(promises);
  }

  //get all user purchase
  async getAllUserPurchase(userId: string) {
    try {
      const userObjectId = new Types.ObjectId(userId);
      const coursePurchases = await this.coursePurchaseModel
        .find({ userId: userObjectId })
        .populate({
          path: 'courseId', // поле, що зберігає ID курсу
          select: 'name type', // повертаємо тільки назву курсу
        })
        .select(
          'courseId status completed accessEndDate accessType paymentPlan availableTo',
        ) // потрібні поля
        .lean()
        .exec();

      // Мапимо результат, щоб courseId містив і id і name
      return coursePurchases.map((purchase) => ({
        course: {
          id: (purchase.courseId as any)._id,
          name: (purchase.courseId as any).name,
          type: (purchase.courseId as any).type,
        },
        status: purchase.status,
        completed: purchase.completed,
        accessEndDate: purchase.accessEndDate,
        id: purchase._id,
        paymentPlan: purchase.paymentPlan,
        accessType: purchase.accessType,
        availableTo: purchase.availableTo,
      }));
    } catch (error) {
      throw new BadRequestException('Не вдалося отримати покупки користувача');
    }
  }
  // update user purchase

  async updateCoursePurchase(purchaseId: string, data: UpdatePurchaseDto) {
    try {
      const updatedPurchase = await this.coursePurchaseModel.findByIdAndUpdate(
        new Types.ObjectId(purchaseId),
        { $set: data },
        { new: true, runValidators: true },
      );

      if (!updatedPurchase) {
        throw new Error();
      }

      return { message: 'success' };
    } catch (error) {
      throw new NotFoundException(`Покупку з ід ${purchaseId} не знайдено`);
    }
  }

  // change status of user purchase
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

      return { message: 'success' };
    } catch (error) {
      throw new NotFoundException(`Покупку з ід ${purchaseId} не знайдено`);
    }
  }
  async extendAccessCoursePurchase(purchaseId: string) {
    try {
      const purchase = await this.coursePurchaseModel.findById(
        new Types.ObjectId(purchaseId),
      );
      if (!purchase) {
        throw new NotFoundException('Покупку не знайдено');
      }

      // Поточна дата або існуюча
      const baseDate = purchase.availableTo
        ? new Date(purchase.availableTo)
        : new Date();

      // Додаємо 1 місяць вручну
      const newAvailableTo = new Date(baseDate);
      newAvailableTo.setMonth(newAvailableTo.getMonth() + 1);

      // Оновлюємо документ
      const updatedPurchase = await this.coursePurchaseModel.findByIdAndUpdate(
        purchase._id,
        {
          $set: {
            availableTo: newAvailableTo,
          },
        },
        { new: true, runValidators: true },
      );
      if (!updatedPurchase) {
        throw new BadRequestException('Помилка оновлення доступу(');
      }
      return { message: 'success' };
    } catch (error) {
      throw new HttpException(
        {
          status: error.status,
          message: error.response.message,
          error: error.response.error,
        },
        error.status,
        {
          cause: error,
        },
      );
    }
  }

  async extendPracticeCoursePurchase(purchaseId: string) {
    try {
      const purchase = await this.coursePurchaseModel.findById(
        new Types.ObjectId(purchaseId),
      );
      if (!purchase) {
        throw new NotFoundException(`Покупку з ід ${purchaseId} не знайдено`);
      }
      const course = await this.courseModel.findById(purchase.courseId);
      if (course.type !== 'CONSULTING' && course.type !== 'ADVANCED') {
        throw new BadRequestException(
          'Курс повинен бути ADVANCED або CONSULTING',
        );
      }

      const practicesCount = await this.moduleModel.countDocuments({
        course: course._id,
        type: 'PRACTICAL',
      });
      console.log('practicesCount', practicesCount);
      console.log('purchase.numberOfPractices', purchase.numberOfPractices);

      if (practicesCount <= purchase.numberOfPractices) {
        return { message: 'Максимальна кількість практик' };
      }

      const updatedPurchase = await this.coursePurchaseModel.findByIdAndUpdate(
        new Types.ObjectId(purchaseId),
        { $inc: { numberOfPractices: 1 } }, // додає +1 до поточного значення
        { new: true, runValidators: true },
      );

      if (!updatedPurchase) {
        throw new BadRequestException('Помилка оновлення покупки');
      }

      return { message: 'success' };
    } catch (error) {
      throw new HttpException(
        {
          status: error.status,
          message: error.response.message,
          error: error.response.error,
        },
        error.status,
        {
          cause: error,
        },
      );
    }
  }

  async halfAccessLesson(purchaseId: string) {
    try {
      const purchase = await this.coursePurchaseModel.findById(
        new Types.ObjectId(purchaseId),
      );
      if (!purchase) {
        throw new BadRequestException(`Покупку з ід ${purchaseId} не знайдено`);
      }
      const course = await this.courseModel.findById(purchase.courseId);
      if (
        course.type !== 'SSK_INDEPENDENT' &&
        course.type !== 'SSK_WITH_CURATOR' &&
        course.type !== 'SSK_WITH_SERGIY'
      ) {
        throw new BadRequestException('Курс повинен бути ССК');
      }

      const lessons = await this.lessonModel
        .find({
          targetId: purchase.courseId,
          targetModel: 'Course',
        })
        .sort({ createdAt: 1 })
        .select('_id');

      const splitIndex = Math.floor(lessons.length / 2);
      const halfAccess = lessons.slice(0, splitIndex);
      const updatePurchase = await this.coursePurchaseModel.findByIdAndUpdate(
        purchaseId, // не обов'язково new Types.ObjectId(), findByIdAndUpdate приймає рядок
        { $set: { lessonsUnlocked: halfAccess } },
        { new: true, runValidators: true },
      );
      if (!updatePurchase) {
        throw new BadRequestException('Помилка оновлення покупки');
      }
      return { message: 'success' };
    } catch (error) {
      throw new HttpException(
        {
          status: error.status,
          message: error.response.message,
          error: error.response.error,
        },
        error.status,
        {
          cause: error,
        },
      );
    }
  }
  async completeAccess(purchaseId: string) {
    try {
      const purchase = await this.coursePurchaseModel.findById(purchaseId);

      if (!purchase) {
        throw new NotFoundException(`Покупку з ід ${purchaseId} не знайдено`);
      }
      if (purchase.accessType === 'FULL')
        throw new BadRequestException('Курс повністю куплений');

      const updateData: UpdatePurchaseAccess = { paymentPlan: 'FULL' };

      if (purchase.paymentPlan === 'PARTIAL') {
        const lessons = await this.lessonModel
          .find({
            targetId: purchase.courseId,
            targetModel: 'Course',
          })
          .sort({ createdAt: 1 })
          .select('_id');
        updateData.lessonsUnlocked = lessons.map((l) => l._id);
      }

      if (purchase.accessType !== 'PERMANENT') {
        updateData.availableTo = purchase.accessEndDate;
      }

      const updatePurchase = await this.coursePurchaseModel.findByIdAndUpdate(
        purchaseId,
        {
          $set: updateData,
        },
      );
      if (!updatePurchase) {
        throw new Error();
      }
      return { message: 'success' };
    } catch (error) {
      throw new NotFoundException(
        `Помилка оновлення доступу для покупки ${purchaseId}`,
      );
    }
  }

  async activateConsultingAdvanced(userId: string, courseId: string) {
    try {
      const userObjectId = new Types.ObjectId(userId);

      const course = await this.courseModel.findById(courseId);
      if (!course) {
        throw new NotFoundException('Курс не знайдено');
      }

      const Data: Record<string, any> = {
        userId: userObjectId,
        courseId: courseId,
        status: 'ACTIVE',
        paymentPlan: 'INSTALLMENT',
        accessStartDate: course.access.dateStart,
        accessEndDate: course.access.dateEnd,
      };
      if (course.type === 'CONSULTING' || course.type === 'ADVANCED') {
        const dateNowPlusMonths = new Date();
        dateNowPlusMonths.setMonth(dateNowPlusMonths.getMonth() + 1);
        Data.availableTo = dateNowPlusMonths;
      }

      const coursePurchase = new this.coursePurchaseModel(Data);
      coursePurchase.save();

      if (!coursePurchase) {
        throw new BadRequestException('Помилка створення покупки');
      }

      return { message: 'success' };
    } catch (error) {
      throw new HttpException(
        {
          status: error.status,
          message: error.response.message,
          error: error.response.error,
        },
        error.status,
        {
          cause: error,
        },
      );
    }
  }
}
