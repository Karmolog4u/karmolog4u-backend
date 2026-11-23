import {
  BadRequestException,
  HttpException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, PipelineStage } from 'mongoose';
import { User } from 'src/user/schemas/user.schema';
import { GetUsersQueryDto } from './dto/get-all-query.dto';
import { GetAllUsersResponseDto } from './dto/get-all-user-response.dto';
import { GetUserByIdDto } from './dto/get-user-by-id.dto';
import { ArrayUserIdsDto } from './dto/array-user-ids.dto';
import { ResponseSuccessDto } from 'src/common/dto/response-success.dto';
import { CreateUserByAdminDto } from './dto/create-user-by-admin.dto';
import { ImportUsersDto } from './dto/import-users.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { generateUniquePassword } from 'src/common/helper/generatePassword';
import { AuthService } from 'src/auth/auth.service';
import { MailService } from 'src/mail/mail.service';
import { ConfigService } from '@nestjs/config';
import * as ExcelJS from 'exceljs';
import { Response } from 'express';
import { Types } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { TokenService } from 'src/token/token.service';
import { CoursePurchaseService } from '../coursePurchase/coursePurchase.service';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @Inject(AuthService) private authService: AuthService,
    @Inject(MailService) private mailService: MailService,
    @Inject(TokenService) private tokenService: TokenService,
    private configService: ConfigService,
    private coursePurchaseService: CoursePurchaseService,
  ) {}
  async getAllUsers(
    query: GetUsersQueryDto,
  ): Promise<GetAllUsersResponseDto[]> {
    try {
      const {
        sortBy = 'createdAt',
        sortOrder = -1,
        searchQuery,
        course_id,
        page = 1,
        limit = 10,
      } = query;

      const skip = (page - 1) * limit;

      const matchStage: Record<string, any> = {};

      if (searchQuery?.trim()) {
        const regex = new RegExp(searchQuery.trim(), 'i');
        matchStage.$or = [
          { name: regex },
          { lastName: regex },
          { email: regex },
        ];
      }

      const sortField = [
        'name',
        'email',
        'createdAt',
        'lastLogin',
        'banned',
        'verified',
        'toDelete',
      ].includes(sortBy)
        ? sortBy
        : 'createdAt';

      return this.userModel
        .aggregate([
          {
            $match: matchStage,
          },

          {
            $lookup: {
              from: 'coursepurchases',
              localField: '_id',
              foreignField: 'userId',
              as: 'coursePurchases',
            },
          },

          {
            $lookup: {
              from: 'courses',
              localField: 'coursePurchases.courseId',
              foreignField: '_id',
              as: 'courses',
            },
          },

          ...(course_id
            ? [
                {
                  $match: {
                    'coursePurchases.courseId': new Types.ObjectId(course_id),
                  },
                },
              ]
            : []),

          {
            $sort: {
              [sortField]: sortOrder === -1 ? -1 : 1,
            },
          },

          {
            $project: {
              id: '$_id',
              name: 1,
              lastName: 1,
              mobPhone: 1,
              email: 1,
              banned: 1,
              verified: 1,
              lastLogin: 1,
              createdAt: 1,
              toDelete: 1,

              courses: {
                $map: {
                  input: '$courses',
                  as: 'course',
                  in: {
                    id: '$$course._id',
                    name: '$$course.name',
                  },
                },
              },

              _id: 0,
            },
          },

          {
            $facet: {
              data: [{ $skip: skip }, { $limit: limit }],
              total: [{ $count: 'count' }],
            },
          },

          {
            $project: {
              data: 1,
              total: {
                $ifNull: [{ $arrayElemAt: ['$total.count', 0] }, 0],
              },
            },
          },
        ])
        .exec();
    } catch (error) {
      throw new InternalServerErrorException(
        'Не вдалося отримати список користувачів. Спробуйте пізніше.',
      );
    }
  }

  async getUserById(id: string): Promise<GetUserByIdDto> {
    try {
      const userId = new mongoose.Types.ObjectId(id.toString());
      const user = await this.userModel
        .aggregate([
          {
            $match: { _id: userId }, // Знаходимо промокод за _id
          },
          {
            $project: {
              name: 1,
              lastName: 1,
              email: 1,
              role: 1,
              mobPhone: 1,
              createdAt: 1,
              lastLogin: 1,
              verified: 1,
              banned: 1,
            },
          },
        ])
        .exec();
      if (!user[0]) {
        throw new NotFoundException('Користувача не знайдено');
      }
      return user[0];
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Помилка отримання списку уроків',
        { cause: error },
      );
    }
  }

  async deleteUsers(data: ArrayUserIdsDto): Promise<ResponseSuccessDto> {
    try {
      const objectIds = data.users.map((id) => new mongoose.Types.ObjectId(id));

      const users = await this.userModel.find({ _id: { $in: objectIds } });

      const now = new Date();
      const nextMonth = new Date(now.setMonth(now.getMonth() + 1));

      const updates = users.map((user) => {
        const toDelete = !user.toDelete; // інверсія
        return {
          updateOne: {
            filter: { _id: user._id },
            update: {
              $set: {
                toDelete,
                expiredAt: toDelete ? nextMonth : null,
              },
            },
          },
        };
      });

      if (updates.length) {
        await this.userModel.bulkWrite(updates);
      }
      //delete all data related to users
      return { message: 'success' };
    } catch (error) {
      throw new NotFoundException('Користувачів не знайдено');
    }
  }

  async blockUsers(data: ArrayUserIdsDto): Promise<ResponseSuccessDto> {
    try {
      const objectIds = data.users.map((id) => new mongoose.Types.ObjectId(id));
      await this.userModel.updateMany({ _id: { $in: objectIds } }, [
        {
          $set: {
            banned: { $not: '$banned' }, // Invert the boolean value of 'banned'
          },
        },
      ]);
      return { message: 'success' };
    } catch (error) {
      throw new NotFoundException('Користувачів не знайдено');
    }
  }

  async createUser(data: CreateUserByAdminDto): Promise<ResponseSuccessDto> {
    try {
      const { education = [], sendToEmail, ...userData } = data;
      const newPassword = generateUniquePassword(16, {
        includeUppercase: true,
        includeNumbers: true,
        includeSymbols: true,
      });
      const user = await this.authService.singUp({
        ...userData,
        password: newPassword,
      });

      if (education.length > 0) {
        await this.addEducation(user._id.toString(), education);
      }

      if (sendToEmail) {
        await this.mailService.sendEmail(
          user.email,
          'Password Recovery',
          'resetPassword', // HBS template name
          {
            name: user.name, // User's full name
            //todo add email
            password: newPassword, // Newly generated password
            loginUrl: `${this.configService.get<string>(
              'FRONT_DOMAIN',
            )}/cabinet/login`, // Login page URL
            appName: 'Karmolog4u',
            year: new Date().getFullYear(),
          },
        );
      }
      return { message: 'success' };
    } catch (error) {
      throw new BadRequestException('Щось пішло не так(');
    }
  }

  private async addEducation(
    userId: string,
    education: NonNullable<CreateUserByAdminDto['education']>,
  ): Promise<void> {
    await Promise.all(
      education.map(({ courseId, paymentPlan }) =>
        this.coursePurchaseService.addCoursePurchase(
          userId,
          courseId,
          paymentPlan,
        ),
      ),
    );
  }

  async importUsers(data: ImportUsersDto): Promise<ResponseSuccessDto> {
    try {
      let importedCount = 0;
      let skippedCount = 0;

      for (const userData of data.users) {
        try {
          const email = userData.email.toLowerCase().trim();
          const existingUser = await this.userModel.exists({ email });
          if (existingUser) {
            skippedCount += 1;
            continue;
          }

          const password = generateUniquePassword(16, {
            includeUppercase: true,
            includeNumbers: true,
            includeSymbols: true,
          });
          const hashedPassword = await bcrypt.hash(password, 10);

          const [createdUser] = await this.userModel.create([
            {
              ...userData,
              email,
              education: undefined,
              password: hashedPassword,
              verified: !!data.verified,
            },
          ]);
          importedCount += 1;

          if (data.education?.length) {
            try {
              await this.addEducation(
                createdUser._id.toString(),
                data.education,
              );
            } catch {
              // Keep importing the remaining users if a course purchase fails.
            }
          }

          if (data.sendToEmail) {
            try {
              await this.mailService.sendEmail(
                createdUser.email,
                'Password Recovery',
                'resetPassword',
                {
                  name: createdUser.name,
                  password,
                  loginUrl: `${this.configService.get<string>(
                    'FRONT_DOMAIN',
                  )}/cabinet/login`,
                  appName: 'Karmolog4u',
                  year: new Date().getFullYear(),
                },
              );
            } catch {
              // Email delivery failure must not stop importing other users.
            }
          }
        } catch {
          skippedCount += 1;
        }
      }

      return {
        message: `Імпорт завершено. Додано: ${importedCount}, пропущено: ${skippedCount}`,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Помилка імпорту користувачів', {
        cause: error,
      });
    }
  }

  async exportAllUser(res: Response) {
    try {
      const users = await this.getUsersForExport();

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Users');

      worksheet.columns = [
        { header: 'ID', key: '_id', width: 10 },
        { header: 'Імя', key: 'name', width: 30 },
        { header: 'Прізвище', key: 'lastName', width: 30 },
        { header: 'Email', key: 'email', width: 30 },
        { header: 'Моб. тел.', key: 'mobPhone', width: 30 },
        { header: 'Верифікований', key: 'verified', width: 30 },
        { header: 'Заблокований', key: 'banned', width: 30 },
        { header: 'Роль', key: 'role', width: 15 },
        { header: 'Останній вхід', key: 'lastLogin', width: 15 },
        { header: 'Навчання', key: 'education', width: 15 },
      ];
      users.forEach((user) => {
        worksheet.addRow({ ...user, education: user.education.join(', ') });
      });
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      res.setHeader('Content-Disposition', 'attachment; filename=users.xlsx');

      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      throw new BadRequestException('Щось пішло не так(');
    }
  }

  async exportUsersByEducation(ids: string[], res: Response) {
    try {

      const courseIds = ids.map((id) => new Types.ObjectId(id));

      const users = await this.getUsersForExport(courseIds);

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Users');

      worksheet.columns = [
        { header: 'ID', key: '_id', width: 10 },
        { header: 'Імя', key: 'name', width: 30 },
        { header: 'Прізвище', key: 'lastName', width: 30 },
        { header: 'Email', key: 'email', width: 30 },
        { header: 'Моб. тел.', key: 'mobPhone', width: 30 },
        { header: 'Верифікований', key: 'verified', width: 30 },
        { header: 'Заблокований', key: 'banned', width: 30 },
        { header: 'Роль', key: 'role', width: 15 },
        { header: 'Останній вхід', key: 'lastLogin', width: 15 },
        { header: 'Навчання', key: 'education', width: 15 },
      ];
      users.forEach((user) => {
        worksheet.addRow({ ...user, education: user.education.join(', ') });
      });
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      res.setHeader('Content-Disposition', 'attachment; filename=users.xlsx');

      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      console.log(error);

      throw new InternalServerErrorException('Щось пішло не так(');
    }
  }

  private async getUsersForExport(courseIds?: Types.ObjectId[]) {
    const pipeline: PipelineStage[] = [
      {
        $lookup: {
          from: 'coursepurchases',
          localField: '_id',
          foreignField: 'userId',
          as: 'coursePurchases',
        },
      },
      {
        $lookup: {
          from: 'courses',
          localField: 'coursePurchases.courseId',
          foreignField: '_id',
          as: 'courses',
        },
      },
      ...(courseIds
        ? [
            {
              $match: {
                'coursePurchases.courseId': { $in: courseIds },
              },
            },
          ]
        : []),
      {
        $project: {
          _id: 1,
          name: 1,
          lastName: 1,
          email: 1,
          mobPhone: 1,
          verified: 1,
          banned: 1,
          role: 1,
          lastLogin: 1,
          education: {
            $map: { input: '$courses', as: 'course', in: '$$course.name' },
          },
        },
      },
    ];

    return this.userModel.aggregate(pipeline);
  }

  async updateUser(
    id: string,
    data: UpdateUserDto,
  ): Promise<ResponseSuccessDto> {
    try {
      const _id = new mongoose.Types.ObjectId(id);
      return await this.userModel.findByIdAndUpdate(
        _id,
        {
          $set: data,
        },
        { new: true, projection: { _id: 0 } },
        //id null
      );
    } catch (error) {
      console.log(error);

      throw new BadRequestException('Щось пішло не так(');
    }
  }
  async resetUserPassword(id: string) {
    const userId = new mongoose.Types.ObjectId(id.toString());
    const user = await this.userModel.findById(userId).select('email').lean();
    if (!user) {
      throw new NotFoundException('Користувача не знайдено');
    }
    const newPassword = generateUniquePassword(16, {
      includeUppercase: true,
      includeNumbers: true,
      includeSymbols: true,
    });

    await this.updateUserPassword(user._id, newPassword);
    await this.tokenService.deleteAllSession(user._id);
    await this.mailService.sendEmail(
      user.email,
      'Password Recovery',
      'resetPassword', // HBS template name
      {
        name: user.name, // User's full name
        password: newPassword, // Newly generated password
        loginUrl: `${this.configService.get<string>(
          'FRONT_DOMAIN',
        )}/cabinet/login`, // Login page URL
        appName: 'Karmolog4u',
        year: new Date().getFullYear(),
      },
    );
    return { message: 'success' };
  }

  private async updateUserPassword(id: Types.ObjectId, password: string) {
    await this.userModel.findByIdAndUpdate(id, {
      password: password,
    });
  }
}
