import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Files } from 'src/files/schemas/files.schema';
import { Types } from 'mongoose';

@Injectable()
export class FilesService {
  constructor(
    @InjectModel(Files.name) private readonly fileModel: Model<Files>,
  ) {}
  async createFiles(filesData: any[]) {
    try {
      const createdFiles = await this.fileModel.insertMany(filesData);
      return createdFiles;
    } catch (error) {
      throw new BadRequestException('Не вдалося додати файли :(');
    }
  }

  async getFiles(targetModel: string, targetId: any) {
    try {
      return await this.fileModel
        .find({ targetModel, targetId })
        .select('originalName savedName path _id')
        .lean()
        .exec();
    } catch (error) {}
  }

  async getFilesByIds(ids: any) {
    const objectIds = ids.map((id) => new Types.ObjectId(id));
    try {
      return await this.fileModel
        .find({ _id: { $in: objectIds } })
        .select('originalName savedName path _id')
        .lean()
        .exec();
    } catch (error) {}
  }

  async deleteFiles(fileIds: any[]) {
    try {
      await this.fileModel.deleteMany({ _id: { $in: fileIds } });
      return { message: 'success' };
    } catch (error) {
      throw new BadRequestException('Не вдалося додати файли :(');
    }
  }

  async getFilesBySavedName(savedName: string) {
    try {
      return await this.fileModel
        .find({ savedName })
        .select('originalName path')
        .lean()
        .exec();
    } catch (error) {}
  }
}
