import {
  BadRequestException,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';
import { StorageService } from 'src/storage/storage.service';
import { ConfigService } from '@nestjs/config';
import { getDifference } from 'src/common/helper/getDifferenceArray';
import { attachTargetToFiles } from 'src/common/helper/attachTargetToFiles';
import { FilesService } from 'src/files/files.service';
import { Lesson } from './schemas/lesson.schema';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';

@Injectable()
export class LessonService {
  constructor(
    @InjectModel(Lesson.name) private lessonModel: Model<Lesson>,
    private readonly storageService: StorageService,
    private readonly configService: ConfigService,
    private readonly filesService: FilesService,
  ) {}

  async createLesson(data: CreateLessonDto) {
    try {
      const { homeworkFiles, bonusFiles, ...lesson } = data;
      //create lesson
      const newLesson = new this.lessonModel({
        ...lesson,
      });
      await newLesson.save();
      if (!newLesson) {
        throw new Error('Помилка створення курсу :(');
      }
      //create folder to lesson material
      const folderPath = await this.storageService.createLessonStorage(
        newLesson._id.toString(),
      );

      const updateData: Record<string, any> = {}; // Store all updates

      if (homeworkFiles?.length > 0) {
        //check exist
        const existingFiles = await this.storageService.filterExistingFiles(
          homeworkFiles,
        );

        //if exist, copy
        if (existingFiles.length > 0) {
          const files = await this.storageService.copyFiles(
            folderPath,
            existingFiles,
          );
          //delete from temporary folder
          await this.storageService.deleteFiles(process.cwd(), existingFiles);
          //add to array lesson id
          const filesToSave = attachTargetToFiles(
            files,
            'Lesson',
            newLesson._id,
          );
          //create file documents
          const savedFiles = await this.filesService.createFiles(filesToSave);
          //get ids to save in db lesson
          const ids = savedFiles.map((item) => item._id.toString());
          //save to lesson
          updateData.homeworkFiles = ids;
        }
      }

      if (bonusFiles?.length > 0) {
        //check exist
        const existingFiles = await this.storageService.filterExistingFiles(
          bonusFiles,
        );

        //if exist, copy
        if (existingFiles.length > 0) {
          const files = await this.storageService.copyFiles(
            folderPath,
            existingFiles,
          );
          //delete from temporary folder
          await this.storageService.deleteFiles(process.cwd(), existingFiles);
          //add to array lesson id
          const filesToSave = attachTargetToFiles(
            files,
            'Lesson',
            newLesson._id,
          );
          //create file documents
          const savedFiles = await this.filesService.createFiles(filesToSave);
          //get ids to save in db lesson
          const ids = savedFiles.map((item) => item._id.toString());
          //save to lesson
          updateData.bonusFiles = ids;
        }

        await this.lessonModel.updateOne(
          { _id: newLesson._id },
          {
            $set: { ...updateData },
          },
        );
      }

      return { message: 'success' };
    } catch (error) {
      console.log(error);

      throw new HttpException(
        {
          status: error.status || 500,
          message:
            error.response?.message ||
            'An error occurred while processing the file',
          error: error.response?.error || 'Internal Server Error',
        },
        error.status || 500,
        {
          cause: error,
        },
      );
    }
  }

  async getAllLessonCourse(query: {
    targetModel: string;
    targetId: any;
    searchQuery?: string;
    status?: string;
    name?: 1 | -1;
    type?: any;
    dateStart?: 1 | -1;
    limit?: number;
    page?: number;
  }) {
    const page = +query.page || 1;
    const limit = +query.limit || 10;
    const skip = (page - 1) * limit;

    // Ensure sorting is properly structured
    const sort: Record<string, 1 | -1> = {};
    if (query.name !== undefined) {
      sort.name = query.name; // Apply sorting correctly
    }
    if (query.dateStart !== undefined) {
      sort.dateStart = query.dateStart; // Apply sorting correctly
    }

    // Construct the filter object dynamically
    const filters: Record<string, any> = {};
    if (query.targetModel) filters.targetModel = query.targetModel;
    if (query.targetId) filters.targetId = query.targetId;
    if (query.status) filters.status = query.status;
    if (query.type) filters['access.type'] = { $in: query.type }; // Supports multiple lesson types

    try {
      const STATUSES = ['DRAFT', 'PUBLISHED', 'ARCHIVE'];
      return await this.lessonModel.aggregate([
        //   {
        //     $match: filters, // Фільтри застосовуються до всього
        //   },
        //   {
        //     $facet: {
        //       paginatedData: [
        //         ...(query.searchQuery
        //           ? [
        //               {
        //                 $match: {
        //                   name: { $regex: query.searchQuery, $options: 'i' },
        //                 },
        //               },
        //             ]
        //           : []),
        //         {
        //           $project: {
        //             id: '$_id',
        //             name: 1,
        //             access: 1,
        //             _id: 0,
        //           },
        //         },
        //         ...(Object.keys(sort).length ? [{ $sort: sort }] : []),
        //         { $skip: skip },
        //         { $limit: limit },
        //       ],
        //       totalCount: [
        //         ...(query.searchQuery
        //           ? [
        //               {
        //                 $match: {
        //                   name: { $regex: query.searchQuery, $options: 'i' },
        //                 },
        //               },
        //             ]
        //           : []),
        //         { $count: 'count' },
        //       ],
        //     },
        //   },
        //   {
        //     $project: {
        //       data: '$paginatedData',
        //       totalPages: {
        //         $ceil: {
        //           $divide: [
        //             { $ifNull: [{ $arrayElemAt: ['$totalCount.count', 0] }, 0] },
        //             limit,
        //           ],
        //         },
        //       },
        //     },
        //   },
        // ]);
        {
          $facet: {
            paginatedData: [
              { $match: filters }, // Apply filters only to paginated data
              {
                $project: {
                  id: '$_id',
                  name: 1,
                  access: 1,
                  _id: 0,
                },
              },
              ...(query.searchQuery
                ? [
                    {
                      $match: {
                        $or: [
                          {
                            name: { $regex: query.searchQuery, $options: 'i' },
                          },
                        ],
                      },
                    },
                  ]
                : []),
              ...(Object.keys(sort).length ? [{ $sort: sort }] : []),
              { $skip: skip },
              { $limit: limit },
            ],
            totalCount: [{ $match: filters }, { $count: 'count' }], // Total count respects filters
            statusCounts: [
              {
                $match: {
                  targetId: query.targetId,
                  targetModel: query.targetModel,
                },
              },
              {
                $group: {
                  _id: '$status', // Count all statuses across the collection (no filtering)
                  count: { $sum: 1 },
                },
              },
              {
                $project: {
                  status: '$_id',
                  count: 1,
                  _id: 0,
                },
              },
              {
                $group: {
                  _id: null,
                  statusMap: { $push: { k: '$status', v: '$count' } },
                },
              },
              {
                $project: {
                  _id: 0,
                  statusCounters: {
                    $arrayToObject: {
                      $map: {
                        input: STATUSES,
                        as: 'status',
                        in: {
                          k: '$$status',
                          v: {
                            $ifNull: [
                              {
                                $toInt: {
                                  $getField: {
                                    field: '$$status',
                                    input: { $arrayToObject: '$statusMap' },
                                  },
                                },
                              },
                              0,
                            ],
                          },
                        },
                      },
                    },
                  },
                },
              },
            ],
          },
        },
        {
          $project: {
            data: '$paginatedData',
            totalPages: {
              $ceil: {
                $divide: [{ $arrayElemAt: ['$totalCount.count', 0] }, limit],
              },
            },
            statusCounters: {
              $arrayElemAt: ['$statusCounts.statusCounters', 0],
            }, // Moved outside filtering, ensuring global status counts
          },
        },
      ]);
    } catch (error) {
      throw new BadRequestException('Помилка у запиті на пошук курсу :(');
    }
  }

  async getAllLessonModule(query: {
    targetModel: string;
    targetId: any;
    searchQuery?: string;
    status?: string;
    name?: 1 | -1;
    type?: any;
    dateStart?: 1 | -1;
    limit?: number;
    page?: number;
  }) {
    const page = +query.page || 1;
    const limit = +query.limit || 10;
    const skip = (page - 1) * limit;

    // Ensure sorting is properly structured
    const sort: Record<string, 1 | -1> = {};
    if (query.name !== undefined) {
      sort.name = query.name; // Apply sorting correctly
    }
    if (query.dateStart !== undefined) {
      sort.dateStart = query.dateStart; // Apply sorting correctly
    }

    // Construct the filter object dynamically
    const filters: Record<string, any> = {};
    if (query.targetModel) filters.targetModel = query.targetModel;
    if (query.targetId) filters.targetId = query.targetId;
    if (query.status) filters.status = query.status;
    if (query.type) filters['access.type'] = { $in: query.type }; // Supports multiple lesson types

    try {
      const STATUSES = ['DRAFT', 'PUBLISHED', 'ARCHIVE'];
      return await this.lessonModel.aggregate([
        //   {
        //     $match: filters, // Фільтри застосовуються до всього
        //   },
        //   {
        //     $facet: {
        //       paginatedData: [
        //         ...(query.searchQuery
        //           ? [
        //               {
        //                 $match: {
        //                   name: { $regex: query.searchQuery, $options: 'i' },
        //                 },
        //               },
        //             ]
        //           : []),
        //         {
        //           $project: {
        //             id: '$_id',
        //             name: 1,
        //             moduleDay: 1,
        //             modulePart: 1,
        //             lessonTimeStart: 1,
        //             lessonTimeEnd: 1,
        //             _id: 0,
        //           },
        //         },
        //         ...(Object.keys(sort).length ? [{ $sort: sort }] : []),
        //         { $skip: skip },
        //         { $limit: limit },
        //       ],
        //       totalCount: [
        //         ...(query.searchQuery
        //           ? [
        //               {
        //                 $match: {
        //                   name: { $regex: query.searchQuery, $options: 'i' },
        //                 },
        //               },
        //             ]
        //           : []),
        //         { $count: 'count' },
        //       ],
        //     },
        //   },
        //   {
        //     $project: {
        //       data: '$paginatedData',
        //       totalPages: {
        //         $ceil: {
        //           $divide: [
        //             { $ifNull: [{ $arrayElemAt: ['$totalCount.count', 0] }, 0] },
        //             limit,
        //           ],
        //         },
        //       },
        //     },
        //   },
        // ]);
        {
          $facet: {
            paginatedData: [
              { $match: filters }, // Apply filters only to paginated data
              {
                $project: {
                  id: '$_id',
                  name: 1,
                  moduleDay: 1,
                  modulePart: 1,
                  lessonTimeStart: 1,
                  lessonTimeEnd: 1,
                  _id: 0,
                },
              },
              ...(query.searchQuery
                ? [
                    {
                      $match: {
                        $or: [
                          {
                            name: { $regex: query.searchQuery, $options: 'i' },
                          },
                        ],
                      },
                    },
                  ]
                : []),
              ...(Object.keys(sort).length ? [{ $sort: sort }] : []),
              { $skip: skip },
              { $limit: limit },
            ],
            totalCount: [{ $match: filters }, { $count: 'count' }], // Total count respects filters
            statusCounts: [
              {
                $match: {
                  targetId: query.targetId,
                  targetModel: query.targetModel,
                },
              },
              {
                $group: {
                  _id: '$status', // Count all statuses across the collection (no filtering)
                  count: { $sum: 1 },
                },
              },
              {
                $project: {
                  status: '$_id',
                  count: 1,
                  _id: 0,
                },
              },
              {
                $group: {
                  _id: null,
                  statusMap: { $push: { k: '$status', v: '$count' } },
                },
              },
              {
                $project: {
                  _id: 0,
                  statusCounters: {
                    $arrayToObject: {
                      $map: {
                        input: STATUSES,
                        as: 'status',
                        in: {
                          k: '$$status',
                          v: {
                            $ifNull: [
                              {
                                $toInt: {
                                  $getField: {
                                    field: '$$status',
                                    input: { $arrayToObject: '$statusMap' },
                                  },
                                },
                              },
                              0,
                            ],
                          },
                        },
                      },
                    },
                  },
                },
              },
            ],
          },
        },
        {
          $project: {
            data: '$paginatedData',
            totalPages: {
              $ceil: {
                $divide: [{ $arrayElemAt: ['$totalCount.count', 0] }, limit],
              },
            },
            statusCounters: {
              $arrayElemAt: ['$statusCounts.statusCounters', 0],
            }, // Moved outside filtering, ensuring global status counts
          },
        },
      ]);
    } catch (error) {
      throw new BadRequestException('Помилка у запиті на пошук курсу :(');
    }
  }

  async getLessonById(lessonId: any) {
    try {
      const lesson = await this.lessonModel
        .findById(lessonId)
        .populate({
          path: 'homeworkFiles',
          select: 'originalName savedName -_id',
        })
        .populate({
          path: 'bonusFiles',
          select: 'originalName savedName -_id',
        })
        .lean();

      return lesson;
    } catch (error) {
      throw new NotFoundException(
        `Помилка, курсу з ${lessonId} не знайдено :(`,
      );
    }
  }

  async updateLesson(id: mongoose.Types.ObjectId, data: UpdateLessonDto) {
    try {
      const { homeworkFiles, bonusFiles, ...lessonData } = data;
      //search lesson
      const oldLesson = await this.lessonModel.findById(id).lean();
      if (!oldLesson) {
        throw new NotFoundException('Курс не знайдено :(');
      }

      const updateData: Record<string, any> = {
        homeworkFiles: [],
        bonusFiles: [],
      }; // Store all updates

      //update lesson
      await this.lessonModel.findByIdAndUpdate(id, lessonData, {
        new: true, // Return the updated document
        runValidators: true, // Run validation checks
      });
      //get files from db
      const oldHomeworkFiles = await this.filesService.getFilesByIds(
        oldLesson.homeworkFiles,
      );

      //check difference between old & new array of files
      const differenceHomeworkFiles = getDifference(
        oldHomeworkFiles,
        homeworkFiles || [],
      );
      if (differenceHomeworkFiles.inBoth.length != 0) {
        const oldFilesIds = differenceHomeworkFiles.inBoth.map((item) =>
          item._id.toString(),
        );
        //save to lesson
        updateData.homeworkFiles = [...oldFilesIds];
      }

      //delete file witch not exist in new data lesson
      if (differenceHomeworkFiles.onlyInArr1.length != 0) {
        //delete from storage
        await this.storageService.deleteFiles(
          this.storageService.getStoragePath(),
          differenceHomeworkFiles.onlyInArr1,
        );
        //delete from db
        const fileIds = differenceHomeworkFiles.onlyInArr1.map((i) => i._id);

        //remove from db
        await this.filesService.deleteFiles(fileIds);
      }
      //add files to lesson folder if exist
      if (differenceHomeworkFiles.onlyInArr2.length != 0) {
        const existingFiles = await this.storageService.filterExistingFiles(
          differenceHomeworkFiles.onlyInArr2,
        );

        //if file exist -> copy to lesson folder
        if (existingFiles.length > 0) {
          const newFiles = await this.storageService.copyFiles(
            this.storageService.getLessonFilePath(id.toHexString()),
            existingFiles,
          );

          //add additional fields to files object
          const filesToSave = attachTargetToFiles(newFiles, 'Lesson', id);
          //save files data to db
          const savedFiles = await this.filesService.createFiles(filesToSave);
          const newFileIds = savedFiles.map((item) => item._id.toString());
          //save to lesson
          updateData.homeworkFiles = [
            ...updateData.homeworkFiles,
            ...newFileIds,
          ];

          //delete files from temp folder
          await this.storageService.deleteFiles(process.cwd(), existingFiles);
        }
      }

      const oldBonusFiles = await this.filesService.getFilesByIds(
        oldLesson.bonusFiles,
      );
      //check difference between old & new array of files
      const differenceBonusFiles = getDifference(
        oldBonusFiles,
        bonusFiles || [],
      );

      if (differenceBonusFiles.inBoth.length != 0) {
        const oldFilesIds = differenceBonusFiles.inBoth.map((item) =>
          item._id.toString(),
        );
        //save to lesson
        updateData.bonusFiles = [...oldFilesIds];
      }
      //delete file witch not exist in new data lesson
      if (differenceBonusFiles.onlyInArr1.length != 0) {
        //delete from storage
        await this.storageService.deleteFiles(
          this.storageService.getStoragePath(),
          differenceBonusFiles.onlyInArr1,
        );
        //delete from db
        const fileIds = differenceBonusFiles.onlyInArr1.map((i) => i._id);
        //remove from db
        await this.filesService.deleteFiles(fileIds);
      }
      // //add files to lesson folder if exist
      if (differenceBonusFiles.onlyInArr2.length != 0) {
        const existingFiles = await this.storageService.filterExistingFiles(
          differenceBonusFiles.onlyInArr2,
        );
        //if file exist -> copy to lesson folder
        if (existingFiles.length > 0) {
          const newFiles = await this.storageService.copyFiles(
            this.storageService.getLessonFilePath(id.toHexString()),
            existingFiles,
          );
          //add additional fields to files object
          const filesToSave = attachTargetToFiles(newFiles, 'Lesson', id);
          //save files data to db
          const savedFiles = await this.filesService.createFiles(filesToSave);

          const newFileIds = savedFiles.map((item) => item._id.toString());
          updateData.bonusFiles = [...updateData.bonusFiles, ...newFileIds];
          //delete files from temp folder
          await this.storageService.deleteFiles(process.cwd(), existingFiles);
        }
      }
      await this.lessonModel.updateOne(
        { _id: id },
        {
          $set: { ...updateData },
        },
      );

      return { message: 'success' };
    } catch (error) {
      throw new HttpException(
        {
          status: error.status || 500,
          message:
            error.response?.message ||
            'An error occurred while processing the file',
          error: error.response?.error || 'Internal Server Error',
        },
        error.status || 500,
        {
          cause: error,
        },
      );
    }
  }

  async deleteLesson(data: any) {
    try {
      //check if ids exist in db and return witch exist
      const existingDocs = await this.lessonModel
        .find({ _id: { $in: data } }, { _id: 1 })
        .lean()
        .exec();
      const existingIds: Types.ObjectId[] = existingDocs.map(
        (doc) => new Types.ObjectId(doc._id),
      );
      if (existingIds.length <= 0) {
        throw new NotFoundException('Помилка, курсів не знайдено');
      }

      //delete lesson by array of existing lesson id
      await this.lessonModel.deleteMany({
        _id: { $in: existingIds },
      });
      //delete lesson folder by exist id
      await this.storageService.deleteLessonFolder(existingIds);

      return { message: 'success' };
    } catch (error) {
      throw new HttpException(
        {
          status: error.status || 500,
          message:
            error.response?.message ||
            'An error occurred while processing the lesson',
          error: error.response?.error || 'Internal Server Error',
        },
        error.status || 500,
        {
          cause: error,
        },
      );
    }
  }

  async updateStatusLesson(data: any) {
    const { id, ...status } = data;
    try {
      const exists = await this.lessonModel.exists({ _id: id });
      if (!exists) {
        throw new NotFoundException(`Курсу з ід "${id}" не знайдено`);
      }
      await this.lessonModel.findByIdAndUpdate(
        id,
        { $set: { ...status } },
        { new: true, runValidators: true },
      );
      return { message: 'success' };
    } catch (error) {
      throw new HttpException(
        {
          status: error.status || 500,
          message:
            error.response?.message ||
            'An error occurred while processing the lesson',
          error: error.response?.error || 'Internal Server Error',
        },
        error.status || 500,
        {
          cause: error,
        },
      );
    }
  }

  async updateModuleLesson(data: any) {
    const { id, targetId } = data;
    try {
      const exists = await this.lessonModel.exists({ _id: id });
      if (!exists) {
        throw new NotFoundException(`Курсу з ід "${id}" не знайдено`);
      }
      await this.lessonModel.findByIdAndUpdate(
        id,
        { $set: { targetId } },
        { new: true, runValidators: true },
      );
      return { message: 'success' };
    } catch (error) {
      console.log(error);

      throw new HttpException(
        {
          status: error.status || 500,
          message:
            error.response?.message ||
            'An error occurred while processing the lesson',
          error: error.response?.error || 'Internal Server Error',
        },
        error.status || 500,
        {
          cause: error,
        },
      );
    }
  }
}
