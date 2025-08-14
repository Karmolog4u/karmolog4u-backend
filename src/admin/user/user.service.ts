import {
  BadRequestException,
  HttpException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
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

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @Inject(AuthService) private authService: AuthService,
    @Inject(MailService) private mailService: MailService,
    private configService: ConfigService,
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

      if (course_id) {
        matchStage.courses = new Types.ObjectId(course_id);
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
              total: { $ifNull: [{ $arrayElemAt: ['$total.count', 0] }, 0] },
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
      throw new HttpException(
        {
          status: error.status,
          message: error.response.message,
        },
        error.status,
        {
          cause: error,
        },
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
      const { education, sendToEmail, ...userData } = data;
      const newPassword = generateUniquePassword(16, {
        includeUppercase: true,
        includeNumbers: true,
        includeSymbols: true,
      });
      const user = await this.authService.singUp({
        ...userData,
        password: newPassword,
      });
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
            )}/auth/login`, // Login page URL
            appName: 'Karmolog4u',
            year: new Date().getFullYear(),
          },
        );
      }
      if (education.length >= 1) {
        //todo add education
      }
      return { message: 'success' };
    } catch (error) {
      throw new BadRequestException('Щось пішло не так(');
    }
  }

  async importUsers(data: ImportUsersDto): Promise<ResponseSuccessDto> {
    try {
      const emails = data.users.map((u) => u.email.toLowerCase().trim());

      // Перевірка, чи емейли вже є в базі
      const existingUsers = await this.userModel
        .find({ email: { $in: emails } }, { email: 1, _id: 0 })
        .lean();

      if (existingUsers.length > 0) {
        const existingEmails = existingUsers.map((u) => u.email);
        throw new BadRequestException({
          message: `Деякі емейли вже існують у базі ${existingEmails}`,
        });
      }
      const users = await Promise.all(
        data.users.map(async (user) => {
          const password = generateUniquePassword(16, {
            includeUppercase: true,
            includeNumbers: true,
            includeSymbols: true,
          });

          const hashedPassword = await bcrypt.hash(password, 10);

          return {
            ...user,
            password: hashedPassword,
            verified: !!data.verified,
            rawPassword: password, // якщо потрібно передати для email
          };
        }),
      );

      await this.userModel.insertMany(users);

      // Відправлення емейлів
      if (data.sendToEmail) {
        const emailPromises = users.map((user) =>
          this.mailService.sendEmail(
            user.email,
            'Password Recovery',
            'resetPassword',
            {
              name: user.name,
              password: user.rawPassword, // передаємо в шаблон
              loginUrl: `${this.configService.get<string>(
                'FRONT_DOMAIN',
              )}/auth/login`,
              appName: 'Karmolog4u',
              year: new Date().getFullYear(),
            },
          ),
        );

        await Promise.all(emailPromises);
      }

      return {
        message: 'Користувачі успішно імпортовані',
      };
    } catch (error) {
      console.log(error);
      
      throw new HttpException(
        {
          status: error.status,
          message: error.response.message,
        },
        error.status,
        {
          cause: error,
        },
      );
    }
  }

  async exportAllUser(res: Response) {
    try {
      const users = await this.userModel.find(
        {},
        { password: 0, toDelete: 0, expiredAt: 0 },
      );

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
        worksheet.addRow(user);
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

  async exportUsersByEducation(id: string, res: Response) {
    try {
      //todo find users in education
      const users = await this.userModel.find(
        {},
        { password: 0, toDelete: 0, expiredAt: 0 },
      );

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
        worksheet.addRow(user);
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
}
