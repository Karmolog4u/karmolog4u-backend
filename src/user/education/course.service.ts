import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Course } from 'src/admin/education/course/schemas/course.schema';
import { Lesson } from 'src/admin/education/lessons/schemas/lesson.schema';
import { Module } from 'src/admin/education/module/schemas/module.schema';
import { CoursePurchase } from 'src/coursePurchase/schemas/coursePurchase.schema';
import { Files } from 'src/files/schemas/files.schema';
import { MailService } from 'src/mail/mail.service';
import { UserEntity } from '../dto/user-entity.dto';
import { getCourseTypeShortName } from './helpers/course-type.helper';
// import { GcsService } from 'src/gcs/gcs.service';
import { trimAnyEmailDomain } from 'src/common/helper/trimEmailDomain';
import { DriveService } from 'src/drive/drive.service';

@Injectable()
export class CourseService {
  constructor(
    @InjectModel(Course.name) private courseModel: Model<Course>,
    @InjectModel(CoursePurchase.name)
    private coursePurchaseModel: Model<CoursePurchase>,
    @InjectModel(Lesson.name) private lessonModel: Model<Lesson>,
    @InjectModel(Module.name) private moduleModel: Model<Module>,
    @InjectModel(Files.name) private filesModel: Model<Files>,
    @Inject(MailService) private mailService: MailService,
    // @Inject(GcsService) private gcsService: GcsService,
    @Inject(DriveService) private driveService: DriveService,
    private configService: ConfigService,
  ) {}

  // file return
  async getCourseDetail(userId: any, courseId: any) {
    const course = await this.courseModel.findById(courseId);
    const optionalFiles = await this.filesModel
      .find(
        {
          targetId: courseId,
          targetModel: 'Course',
        },
        {
          originalName: 1,
          savedName: 1,
          _id: 0, // якщо не потрібно _id
        },
      )
      .lean({ virtuals: false });

    if (!course) {
      throw new NotFoundException('Курс не знайдено');
    }
    const cleanCourse = course.toObject({ versionKey: false, virtuals: true });

    const purchase = await this.coursePurchaseModel.findOne({
      userId,
      courseId,
    });
    if (!purchase) {
      throw new ForbiddenException('Цей курс не куплений користувачем');
    }

    return {
      ...cleanCourse,
      optionalFiles,
      purchaseInfo: purchase,
    };
  }

  async getLessonsSSK(userId: any, courseId: any) {
    const course = await this.courseModel.findById(courseId);
    if (!course) {
      throw new NotFoundException('Курс не знайдено');
    }
    if (
      !['SSK_INDEPENDENT', 'SSK_WITH_CURATOR', 'SSK_WITH_SERGIY'].includes(
        course.type,
      )
    ) {
      throw new BadRequestException('Курс не відповідає типу ССК');
    }
    const purchase = await this.coursePurchaseModel.findOne({
      userId,
      courseId,
    });
    if (!purchase) {
      throw new ForbiddenException('Цей курс не куплений користувачем');
    }

    const lessons = await this.lessonModel.find(
      { targetId: courseId, targetModel: 'Course' },
      '_id name internalDescription',
    );
    if (!lessons) {
      throw new NotFoundException('Уроків не знайдено');
    }

    const unlockedIds = new Set(
      purchase.lessonsUnlocked.map((l) => String(l._id)),
    );

    return lessons.map((lesson) => ({
      id: lesson._id,
      name: lesson.name,
      internalDescription: lesson.internalDescription,
      isAvailable: unlockedIds.has(String(lesson._id)),
    }));
  }

  async getLessonsList(userId: any, courseId: any) {
    const purchase = await this.coursePurchaseModel.findOne({
      userId,
      courseId,
    });
    if (!purchase) {
      throw new ForbiddenException('Цей курс не куплений користувачем');
    }

    const modules = await this.moduleModel.aggregate([
      {
        $match: { course: new Types.ObjectId(courseId) }, // вибірка модулів по курсу
      },
      {
        $lookup: {
          from: 'lessons',
          let: { moduleId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$targetModel', 'Module'] },
                    { $eq: ['$targetId', '$$moduleId'] },
                  ],
                },
              },
            },
            {
              $project: {
                _id: 0,
                moduleDay: 1,
                modulePart: 1,
                name: 1,
                lessonTimeStart: 1,
                lessonTimeEnd: 1,
                id: '$_id',
              },
            },
          ],
          as: 'lessonsList',
        },
      },
      {
        $project: {
          _id: 0,
          name: 1,
          type: 1,
          durationInDays: 1,
          access: 1,
          lessonsList: 1,
        },
      },
    ]);
    if (modules.length == 0) {
      throw new NotFoundException('Модулів не знайдено');
    }
    return modules;
  }

  async getLesson(userId: any, lessonId: string) {
    const now = Date.now();

    // 1. Find lesson by ID
    const lesson = await this.lessonModel
      .findById(lessonId)
      .populate({
        path: 'homeworkFiles',
        select: 'savedName originalName', // вибір полів
      })
      .populate({
        path: 'bonusFiles',
        select: 'savedName originalName', // вибір полів
      })
      .exec();

    if (!lesson) throw new NotFoundException('Уроків не знайдено');

    // 2. Check lesson.access.type = TO_DATE

    if (lesson.targetModel === 'Module') {
      if (lesson?.access?.type === 'TO_DATE') {
        if (
          now < lesson?.access.dateStart.getTime() ||
          now > lesson?.access.dateEnd.getTime()
        ) {
          throw new ForbiddenException('Урок не доступний за датою');
        }
      }
      // ---- TARGET: MODULE ----
      const module = await this.moduleModel.findById(lesson.targetId).lean();
      if (!module) throw new NotFoundException('Модуль не знайдено');

      if (
        now < module.access.dateStart.getTime() ||
        now > module.access.dateEnd.getTime()
      ) {
        throw new ForbiddenException('Модуль не доступний за датою');
      }

      const purchase = await this.coursePurchaseModel.findOne({
        userId,
        courseId: module.course,
      });

      if (!purchase) throw new ForbiddenException('Покупки не знайдено');

      if (
        !(now > purchase.accessStartDate.getTime()) ||
        !(now < purchase.availableTo.getTime())
      ) {
        throw new ForbiddenException('Курс ще не розпочався або закінчився');
      }

      return lesson; // ✅ доступ є
    }

    // 3. Check by targetModel
    if (lesson.targetModel === 'Course') {
      // ---- TARGET: COURSE ----
      const course = await this.courseModel.findById(lesson.targetId);
      if (!course) {
        throw new NotFoundException('Курс не знайдено');
      }
      const purchase = await this.coursePurchaseModel.findOne({
        userId,
        courseId: course._id,
      });

      if (!purchase) throw new NotFoundException('Покупки не знайдено');

      if (
        now < purchase.accessStartDate.getTime() ||
        now > purchase.availableTo.getTime()
      ) {
        throw new ForbiddenException('Курс ще не розпочався або закінчився');
      }

      if (purchase.paymentPlan === 'PARTIAL') {
        if (purchase.lessonsUnlocked?.some((id) => id.equals(lesson._id))) {
          throw new ForbiddenException('Урок заблокований по частковій оплаті');
        }
      }

      return lesson; // ✅ доступ є
    }

    throw new ForbiddenException('Урок має невірно вказане джерело');
  }

  async sendFeedback(user: any, id: any, data: any) {
    // call get lesson to check if user have access
    const lesson = await this.getLesson(user._id, id);
    if (!lesson) throw new NotFoundException('Уроків не знайдено');

    // send q&a to mail
    await this.mailService.sendEmail(
      this.configService.get<string>('ADMIN_MAIL'),
      'Q&A feedback',
      'feedback', // HBS template name
      {
        name: user.name,
        lastName: user.lastName,
        data: data.items,
        appName: 'Karmolog4u',
        year: new Date().getFullYear(),
      },
    );

    //change completed to true
    if (lesson.targetModel === 'Module') {
      // ---- TARGET: MODULE ----
      const module = await this.moduleModel.findById(lesson.targetId).lean();
      if (!module) throw new NotFoundException('Модуль не знайдено');

      await this.coursePurchaseModel.findOneAndUpdate(
        {
          userId: user._id,
          courseId: module.course,
        },
        {
          $set: { completed: true },
        },
      );
      return { message: 'success' };
    }

    // 3. Check by targetModel
    if (lesson.targetModel === 'Course') {
      // ---- TARGET: COURSE ----
      const course = await this.courseModel.findById(lesson.targetId);
      await this.coursePurchaseModel.findOneAndUpdate(
        {
          userId: user._id,
          courseId: course._id,
        },
        {
          $set: { completed: true },
        },
      );

      return { message: 'success' };
    }
  }

  async getCertificate(user: UserEntity, courseId: any) {
    const purchase = await this.coursePurchaseModel.findOne({
      userId: user._id,
      courseId,
    });
    if (!purchase) {
      throw new ForbiddenException('Цей курс не куплений користувачем');
    }
    if (!purchase.completed) {
      throw new NotFoundException('Курс не завершений, сертифікат недоступний');
    }
    const course = await this.courseModel.findById(purchase.courseId);
    if (!course) {
      throw new NotFoundException('Курс не знайдено');
    }

    // Map course type to short name (e.g., SSK_INDEPENDENT -> ssk_ind)
    const courseTypeShort = getCourseTypeShortName(course.type);
    const userName = trimAnyEmailDomain(user.email);
    const fileName = `${userName}_${courseTypeShort}.pdf`;

    const file = await this.driveService.downloadFile(fileName);
    // console.log(`Certificate file for ${fileName}:`, file);

    const certificateFileName = `certificate_${fileName}`;

    return {
      certificateFileName,
      file,
    };
  }

  async getCourseData(courseId: any) {
    const course = await this.courseModel.findById(courseId);
    // const optionalFiles = await this.filesModel
    //   .find(
    //     {
    //       targetId: courseId,
    //       targetModel: 'Course',
    //     },
    //     {
    //       originalName: 1,
    //       savedName: 1,
    //       _id: 0, // якщо не потрібно _id
    //     },
    //   )
    //   .lean({ virtuals: false });

    if (!course) {
      throw new NotFoundException('Курс не знайдено');
    }
    const cleanCourse = course.toObject({ versionKey: false, virtuals: true });

    return {
      ...cleanCourse,
    };
  }
}
