import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Verification } from './schemas/verification.schema';
import { Model, Types } from 'mongoose';
import { CreateVerifyToken } from './dto/create-verify-token.dto';
import { GetVerifyToken } from './dto/get-verify-token.dto';
import { DeleteVerifyToken } from './dto/delete-verify-token.dto';

@Injectable()
export class VerificationService {
  constructor(
    @InjectModel(Verification.name) private verifyModel: Model<Verification>,
  ) {}

  async createVerifyToken(data: CreateVerifyToken) {
    try {
      const verifyToken = new this.verifyModel(data);
      await verifyToken.save();
      return { message: 'success' };
    } catch (error) {
      throw new BadRequestException('Помилка запису в БД, токен вже існує!');
    }
  }

  async getVerifyToken(data: GetVerifyToken) {
    try {
      const id = new Types.ObjectId(data.userId);
      return await this.verifyModel.findOne({
        userId: id,
        email: data.email,
      });
    } catch (error) {
      throw new NotFoundException('Токен верифікації не знайдено');
    }
  }

  async deleteVerifyToken(data: DeleteVerifyToken) {
    try {
      await this.verifyModel.findByIdAndDelete(data._id);
      return { message: 'success' };
    } catch (error) {
      throw new NotFoundException('Токен верифікації не знайдено');
    }
  }
}
