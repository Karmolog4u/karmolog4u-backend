import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
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
import { CourseService } from '../education/course/course.service';
import {
  advTotalPayments,
  consultingTotalPayments,
} from 'src/common/helper/consts';

@Injectable()
export class CoursePurchaseService {
  constructor(
    @InjectModel(CoursePurchase.name)
    private readonly coursePurchaseModel: Model<CoursePurchaseDocument>,
    @InjectModel(Course.name) private courseModel: Model<Course>,
    @InjectModel(Lesson.name) private lessonModel: Model<Lesson>,
    @InjectModel(Module.name) private moduleModel: Model<Module>,
    private readonly courseService: CourseService,
  ) {}

  async addCoursePurchase(
    userId: string,
    courseId: string,
    paymentPlan: 'FULL' | 'PARTIAL' | 'INSTALLMENT',
  ) {
    const sskTypes = ['SSK_INDEPENDENT', 'SSK_WITH_CURATOR', 'SSK_WITH_SERGIY'];

    const advancedTypes = ['ADVANCED', 'CONSULTING'];
    try {
      const userObjectId = new Types.ObjectId(userId);
      const courseObjectId = new Types.ObjectId(courseId);

      const existingPurchase = await this.coursePurchaseModel.findOne({
        userId: userObjectId,
        courseId: courseObjectId,
      });
      if (existingPurchase) {
        throw new BadRequestException('Користувач має таку покупку!');
      }

      const course = await this.courseModel.findById(courseObjectId);
      if (!course) {
        throw new NotFoundException('Курс не знайдено');
      }

      // create obj data to record
      const data: Record<string, any> = {
        userId: userObjectId,
        courseId: courseObjectId,
        status: 'ACTIVE',
        paymentPlan,
        price: course.price,
        accessType: course.access.type,
      };

      // Визначаємо accessStartDate та accessEndDate
      if (course.access.type === 'TO_DATE') {
        data.accessStartDate = course.access.dateStart;
        data.accessEndDate = course.access.dateEnd;
      } else {
        const accessStartDate = new Date();

        data.accessStartDate = accessStartDate;

        const accessEndDate = new Date(accessStartDate);

        if (course.access.type === 'PERMANENT') {
          accessEndDate.setFullYear(accessEndDate.getFullYear() + 100);
        }

        if (course.access.type === 'FOR_PERIOD') {
          accessEndDate.setMonth(
            accessEndDate.getMonth() + course.access.months,
          );
        }

        data.accessEndDate = accessEndDate;
      }

      // За замовчуванням availableTo = accessStartDate
      data.availableTo = data.accessEndDate;

      // SSK
      if (sskTypes.includes(course.type)) {
        const lessons = await this.lessonModel
          .find({
            targetId: course._id,
            targetModel: 'Course',
          })
          .sort({ createdAt: 1 })
          .select('_id');

        if (paymentPlan === 'FULL') {
          data.lessonsUnlocked = lessons.map((lesson) => lesson._id);
        }

        if (paymentPlan === 'PARTIAL') {
          const splitIndex = Math.floor(lessons.length / 2);

          data.lessonsUnlocked = lessons
            .slice(0, splitIndex)
            .map((lesson) => lesson._id);
        }
      }

      // ADVANCED / CONSULTING
      if (
        advancedTypes.includes(course.type) &&
        paymentPlan === 'INSTALLMENT'
      ) {
        const availableTo = new Date(data.accessStartDate);

        availableTo.setMonth(availableTo.getMonth() + 1);

        data.availableTo = availableTo;
      }

      const coursePurchase = new this.coursePurchaseModel(data);

      await coursePurchase.save();

      return { message: 'success' };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Помилка створення покупки');
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
        .select(
          'courseId status completed accessEndDate accessType paymentPlan availableTo price',
        )
        .populate({
          path: 'courseId',
          select: '_id name type',
        })
        .lean()
        .exec();

      // Мапимо результат, щоб courseId містив і id і name

      const info = coursePurchases.map((purchase) => ({
        course: {
          id: purchase.courseId?._id,
          name: (purchase.courseId as any)?.name,
          type: (purchase.courseId as any)?.type,
        },
        status: purchase.status,
        completed: purchase.completed,
        accessEndDate: purchase.accessEndDate,
        id: purchase._id,
        paymentPlan: purchase.paymentPlan,
        accessType: purchase.accessType,
        availableTo: purchase.availableTo,
        price: purchase.price,
      }));

      return info;
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
            numberOfPayments: (purchase.numberOfPayments += 1),
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
      const course = await this.courseService.getCourseById(purchase.courseId);
      const paymentPlansMap = {
        CONSULTING: consultingTotalPayments,
        ADVANCED: advTotalPayments,
      };
      const totalPayments = paymentPlansMap[course.type];
      if (totalPayments) {
        updateData.numberOfPayments = totalPayments;
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
