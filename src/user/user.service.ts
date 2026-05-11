import { UserResponseDto } from './dto/find-user-by-id-response.dto';
import { UserInfoResponseDto } from './dto/user-info-response.dto';
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
import { Types } from 'mongoose';
import { StorageService } from 'src/storage/storage.service';
import { UpdateByUserDto } from './dto/update-by-user.dto';
import { getFileNameFromUrl } from 'src/common/helper/getFileNameFromUrl';
import { coverCompress } from 'src/common/helper/coverCompress';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly storageService: StorageService,

    private readonly configService: ConfigService,
  ) {}

  async findUserById(userData: FindUserByIdDto): Promise<UserResponseDto> {
    try {
      const user = await this.userModel.findOne({ ...userData });
      if (!user) {
        throw new Error();
      }
      return user;
    } catch (error) {
      throw new NotFoundException('Користувача не знайдено');
    }
  }

  async findUserByEmail(userData: FindUserByEmailDto): Promise<UserEntity> {
    try {
      const user = await this.userModel.findOne({ ...userData }).exec();
      if (!user) {
        throw new Error();
      }
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

  async getUserInfo(data: {
    id: Types.ObjectId;
  }): Promise<UserInfoResponseDto> {
    try {
      const user = await this.userModel
        .findById(data.id)
        .select('name lastName mobPhone email cover');

      if (!user) {
        throw new Error();
      }
      return user;
    } catch (error) {
      throw new NotFoundException('Користувача не знайдено');
    }
  }

  async newUser(userData: NewUserDto) {
    try {
      const user = new this.userModel(userData);

      await user.save();
      const folderPath = await this.storageService.createUserStorage(
        user._id.toString(),
      );
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

  async updateByUser(
    _id: UserIdDto,
    userData: UpdateByUserDto,
  ): Promise<UserInfoResponseDto> {
    try {
      const { cover, ...data } = userData;
      const updateData: Record<string, any> = { ...data }; // Store all updates
      if (cover) {
        const folderPath = await this.storageService.createUserStorage(
          _id.toString(),
        );
        //get name from url
        const coverName = getFileNameFromUrl(cover);
        //check exist
        const fileExist = await this.storageService.coverExists(
          this.storageService.getTempCoversFolder(),
          coverName,
        );
        //if exist, compress
        if (fileExist) {
          const coverLink = await coverCompress(
            cover,
            folderPath,
            this.configService,
          );
          updateData.cover = coverLink;
        }
      }

      const user = await this.userModel.findByIdAndUpdate(
        _id,
        { $set: updateData },
        {
          new: true,
          projection: {
            name: 1,
            lastName: 1,
            mobPhone: 1,
            email: 1,
            cover: 1,
            _id: 0,
          },
        },
      );
      if (!user) {
        throw new Error();
      }

      return user;
    } catch (error) {
      throw new BadRequestException('Помилка оновлення користувача');
    }
  }
}
