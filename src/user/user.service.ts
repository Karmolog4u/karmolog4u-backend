import { UserResponseDto } from './dto/user-response.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserIdDto } from './dto/user-id.dto';
import { NewUserDto } from './dto/new-user.dto';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import { FindUserByIdDto, FindUserByEmailDto } from './dto/find-user.dto';
import { UserEntity } from './dto/user-entity.dto';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async findUserById(userData: FindUserByIdDto): Promise<UserResponseDto> {
    try {
      const user = await this.userModel.findOne({ ...userData });
      return user;
    } catch (error) {
      throw new NotFoundException('Користувача не знайдено');
    }
  }

  async findUserByEmail(userData: FindUserByEmailDto): Promise<UserEntity> {
    try {
      const user = await this.userModel.findOne({ ...userData }).exec();
      return user;
    } catch (error) {
      throw new NotFoundException('Користувача не знайдено');
    }
  }

  async findAllUser(): Promise<UserEntity[]> {
    const users = await this.userModel.find({});
    if (!users) {
      throw new NotFoundException('Users not found');
    }
    return users;
  }

  async newUser(userData: NewUserDto) {
    try {
      const user = new this.userModel(userData);
      await user.save();
      return user;
    } catch (error) {
      throw new BadRequestException('Email вже зареєстрований!');
    }
  }

  async updateUser(
    _id: UserIdDto,
    userData: UpdateUserDto,
  ): Promise<UserResponseDto> {
    try {
      const user = await this.userModel.findByIdAndUpdate(
        _id,
        {
          $set: userData,
        },
        { new: true, projection: { _id: 0 } },
      );
      return user;
    } catch (error) {}
    throw new BadRequestException('Помилка оновлення користувача');
  }

  async updateUserPassword(_id: UserIdDto, password: string) {
    try {
      const user = await this.userModel.findByIdAndUpdate(
        _id,
        {
          $set: { password },
        },
        { new: true, projection: { _id: 0 } },
      );
      return user;
    } catch (error) {
      throw new BadRequestException('Помилка оновлення паролю');
    }
  }
}
