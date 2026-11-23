import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Discount } from './schemas/discount.schema';
import { Discount as DiscountInterface } from './interface/discount.interface';
import { Model } from 'mongoose';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { EditDiscountDto } from './dto/edit-discount.dto';
import { FindDiscountDto } from './dto/find-discount.dto';

@Injectable()
export class DiscountService {
  constructor(
    @InjectModel(Discount.name) private discountModel: Model<Discount>,
  ) {}

  async createDiscount(discountData: CreateDiscountDto): Promise<any> {
    try {
      const discount = new this.discountModel(discountData);
      await discount.save();
      return { message: 'success' };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new BadRequestException(`${message}, Mongo DB`);
    }
  }

  async editDiscount(
    discountData: EditDiscountDto,
  ): Promise<DiscountInterface> {
    try {
      const { refId, ...data } = discountData;

      return await this.discountModel
        .findOneAndUpdate({ refId: refId }, data, {
          upsert: true,
          new: true,
          projection: { start: 1, expiredAt: 1, discount: 1 },
        })
        .exec();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new BadRequestException(`${message}, Mongo DB`);
    }
  }

  async findDiscount(refId: FindDiscountDto): Promise<DiscountInterface> {
    try {
      return await this.discountModel.findOne(
        { ...refId },
        'discount start expiredAt',
      );
    } catch (error) {
      throw new NotFoundException(`Знижку з refId ${refId} не знайдено`);
    }
  }

  async deleteDiscount(refId: FindDiscountDto): Promise<any> {
    try {
      await this.discountModel.findOneAndDelete({
        ...refId,
      });
      return { message: 'success' };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new BadRequestException(`${message}, Mongo DB`);
    }
  }
}
