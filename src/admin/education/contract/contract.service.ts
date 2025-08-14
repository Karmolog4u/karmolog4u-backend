import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Contract } from './schemas/contract.schema';
import { Model } from 'mongoose';

@Injectable()
export class ContractService {
  constructor(
    @InjectModel(Contract.name) private contractModel: Model<Contract>,
  ) {}

  async createContract(data: any) {
    try {
      const newContract = new this.contractModel(data);
      await newContract.save();
      return { message: 'success' };
    } catch (error) {
      throw new BadRequestException('Помилка створення контракту :(');
    }
  }

  async getContract(data: any) {
    try {
      return await this.contractModel.findOne({ course: data });
    } catch (error) {}
  }
  async updateContract(data: any) {
    try {
      const oldContract = await this.contractModel.find({
        course: data.course,
      });

      if (oldContract.length !== 0) {
        await this.contractModel.findOneAndUpdate(
          { course: data.course }, // умова пошуку по полю course
          data.contract, // дані для оновлення
          {
            new: true, // повернути оновлений документ
            runValidators: true, // запуск валідації за схемою
          },
        );
      } else {
        await this.createContract({
          course: data.course,
          ...data.contract,
        });
      }

      return { message: 'success' };
    } catch (error) {
      throw new BadRequestException('Помилка оновлення контракту :(');
    }
  }
  async deleteContract(courseIds: any) {
    // const Ids = data.map((data) => data.toHexString());
    try {
      await this.contractModel.deleteMany({
        course: { $in: courseIds },
      });
      return { message: 'success' };
    } catch (error) {
      throw new BadRequestException('Не  вдалося видалити контракти');
    }
  }
}
