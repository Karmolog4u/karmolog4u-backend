import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';
import { Course } from './schemas/course.schema';
import { CreateCourseDto } from './dto/create-course.dto';
import { ContractService } from '../contract/contract.service';
import { StorageService } from 'src/storage/storage.service';
import { ConfigService } from '@nestjs/config';
import { coverCompress } from 'src/common/helper/coverCompress';
import { getFileNameFromUrl } from 'src/common/helper/getFileNameFromUrl';
import { getDifference } from 'src/common/helper/getDifferenceArray';
import { UpdateCourseDto } from './dto/update-course.dto';
import { attachTargetToFiles } from 'src/common/helper/attachTargetToFiles';
import { FilesService } from 'src/files/files.service';

@Injectable()
export class CourseService {
  constructor(
    @InjectModel(Course.name) private courseModel: Model<Course>,
    private readonly contractService: ContractService,
    private readonly storageService: StorageService,
    private readonly configService: ConfigService,
    private readonly filesService: FilesService,
  ) {}

  async createCourse(data: CreateCourseDto) {
    try {
      const { cover, optionalFiles, ...course } = data;
      //create course
      const newCourse = new this.courseModel({
        ...course,
      });
      await newCourse.save();
      if (!newCourse) {
        throw new Error('Помилка створення курсу :(');
      }

      if (data?.contract) {
        //create contract
        await this.contractService.createContract({
          ...data.contract,
          course: newCourse._id,
        });
      }

      //create folder to course material
      const folderPath = await this.storageService.createCourseStorage(
        newCourse._id.toString(),
      );

      if (cover) {
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
            this.storageService.getSubFolderPath(folderPath, 'covers'),
            this.configService,
          );
          // update course document with new cover
          await this.courseModel.findByIdAndUpdate(newCourse._id, {
            cover: coverLink,
          });
        }
      }

      if (optionalFiles?.length > 0) {
        //check exist
        const existingFiles = await this.storageService.filterExistingFiles(
          // this.storageService.getTempFilesFolder(),
          optionalFiles,
        );

        //if exist, copy
        if (existingFiles.length > 0) {
          const files = await this.storageService.copyFiles(
            this.storageService.getSubFolderPath(folderPath, 'materials'),
            existingFiles,
          );
          //delete from temporary folder
          await this.storageService.deleteFiles(process.cwd(), existingFiles);
          //add to array course id
          const filesToSave = attachTargetToFiles(
            files,
            'Course',
            newCourse._id,
          );
          //create file documents
          await this.filesService.createFiles(filesToSave);
        }
      }

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

  async getAllCourse(query: {
    searchQuery?: string;
    status?: string;
    name?: 1 | -1;
    type?: any;
    access?: any;
    completeness?: any;
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

    // Construct the filter object dynamically
    const filters: Record<string, any> = {};
    if (query.status) filters.status = query.status;
    if (query.type) filters.type = { $in: query.type }; // Supports multiple course types
    if (query.access) filters['access.type'] = { $in: query.access }; // Filters inside the access object
    if (query.completeness) filters.completeness = { $in: query.completeness }; // Supports multiple completeness values

    try {
      const STATUSES = ['DRAFT', 'PUBLISHED', 'ARCHIVE'];
      return await this.courseModel.aggregate([
        {
          $facet: {
            paginatedData: [
              { $match: filters }, // Apply filters only to paginated data
              {
                $project: {
                  id: '$_id',
                  name: 1,
                  status: 1,
                  stream: 1,
                  access: 1,
                  completeness: 1,
                  chat: 1,
                  type: 1,
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

  async getCourseById(courseId: any) {
    try {
      const course = await this.courseModel.aggregate([
        { $match: { _id: courseId } },
        {
          $lookup: {
            from: 'contracts',
            localField: '_id',
            foreignField: 'course',
            as: 'contract',
          },
        },
        {
          $unwind: {
            path: '$contract',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: 'files',
            let: { courseId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$targetModel', 'Course'] },
                      { $eq: ['$targetId', '$$courseId'] },
                    ],
                  },
                },
              },
              {
                $project: {
                  _id: 0,
                  originalName: 1,
                  savedName: 1,
                },
              },
            ],
            as: 'optionalFiles',
          },
        },
        {
          $project: {
            _id: 0,
            id: '$_id',
            name: 1,
            type: 1,
            completeness: 1,
            access: 1,
            chat: 1,
            optionalLink: 1,
            practiceInvoice: 1,
            stream: 1,
            price: 1,
            literature: 1,
            cover: 1,
            status: 1,
            optionalFiles: 1,
            contract: {
              date: '$contract.date',
              signUpTo: '$contract.signUpTo',
              price: '$contract.price',
              header: '$contract.header',
              points: '$contract.points',
            },
          },
        },
      ]);
      return course[0];
    } catch (error) {
      throw new NotFoundException(
        `Помилка, курсу з ${courseId} не знайдено :(`,
      );
    }
  }

  async updateCourse(id: mongoose.Types.ObjectId, data: UpdateCourseDto) {
    try {
      const { cover, optionalFiles, ...courseData } = data;
      //search course
      const oldCourse = await this.courseModel.findById(id).exec();
      if (!oldCourse) {
        throw new NotFoundException('Курс не знайдено :(');
      }

      const updateData: Record<string, any> = { ...courseData }; // Store all updates

      if ((cover && oldCourse.cover !== cover) || cover == '') {
        //if old cover true, delete
        if (oldCourse.cover) {
          const oldCoverName = getFileNameFromUrl(oldCourse.cover);
          await this.storageService.deleteFiles(
            this.storageService.getCourseFilePath(id.toHexString(), 'covers'),
            [
              {
                path: oldCoverName,
              },
            ],
          );
        }
        //if new cover, add to course folder
        if (cover) {
          const coverName = getFileNameFromUrl(cover);
          //check if cover exist
          const coverExist = await this.storageService.coverExists(
            this.storageService.getTempCoversFolder(),
            coverName,
          );
          //if exist compress and save to storage
          if (coverExist) {
            const coverLink = await coverCompress(
              cover,
              this.storageService.getCourseFilePath(id.toHexString(), 'covers'),
              this.configService,
            );
            //add link to update
            updateData.cover = coverLink;
          }
        }
      }

      //update course
      await this.courseModel.findByIdAndUpdate(id, updateData, {
        new: true, // Return the updated document
        runValidators: true, // Run validation checks
      });
      //get files from db
      const oldFiles = await this.filesService.getFiles('Course', id);
      //check difference between old & new array of files
      const difference = getDifference(oldFiles, optionalFiles || []);
      //delete file witch not exist in new data course
      if (difference.onlyInArr1.length != 0) {
        //delete from storage
        await this.storageService.deleteFiles(
          this.storageService.getStoragePath(),
          difference.onlyInArr1,
        );
        //delete from db
        const fileIds = difference.onlyInArr1.map((i) => i._id);

        await this.filesService.deleteFiles(fileIds);
      }
      // //add files to course folder if exist
      if (difference.onlyInArr2.length != 0) {
        const existingFiles = await this.storageService.filterExistingFiles(
          difference.onlyInArr2,
        );
        //if file exist -> copy to course folder
        if (existingFiles.length > 0) {
          const newFiles = await this.storageService.copyFiles(
            this.storageService.getCourseFilePath(
              id.toHexString(),
              'materials',
            ),
            existingFiles,
          );
          //add additional fields to files object
          const filesToSave = attachTargetToFiles(newFiles, 'Course', id);
          //save files data to db
          await this.filesService.createFiles(filesToSave),
            //delete files from temp folder
            await this.storageService.deleteFiles(process.cwd(), existingFiles);
        }
      }

      // update contract if available
      if (!data?.contract) {
        await this.contractService.deleteContract([id]);
      } else {
        if (Object.keys(data.contract).length != 0) {
          await this.contractService.updateContract({
            course: id,
            contract: data.contract,
          });
        }
      }

      return { message: 'success' };
    } catch (error) {
      throw new HttpException(
        {
          status: error.status,
          message: error.response.message,
          error: error.response.error,
        },
        error.status,
        {
          cause: error,
        },
      );
    }
  }

  async deleteCourse(data: any) {
    try {
      //check if ids exist in db and return witch exist
      const existingDocs = await this.courseModel
        .find({ _id: { $in: data } }, { _id: 1 })
        .lean()
        .exec();
      const existingIds: Types.ObjectId[] = existingDocs.map(
        (doc) => new Types.ObjectId(doc._id),
      );
      if (existingIds.length <= 0) {
        throw new NotFoundException('Помилка, курсів не знайдено');
      }

      //delete contract by array of course id
      await this.contractService.deleteContract(existingIds);
      //delete course by array of existing course id
      await this.courseModel.deleteMany({
        _id: { $in: existingIds },
      });
      //delete course folder by exist id
      await this.storageService.deleteCourseFolder(existingIds);

      return { message: 'success' };
    } catch (error) {
      throw new HttpException(
        {
          status: error.status || 500,
          message:
            error.response?.message ||
            'An error occurred while processing the course',
          error: error.response?.error || 'Internal Server Error',
        },
        error.status || 500,
        {
          cause: error,
        },
      );
    }
  }

  async updateStatusCourse(data: any) {
    const { id, ...status } = data;
    try {
      const exists = await this.courseModel.exists({ _id: id });
      if (!exists) {
        throw new NotFoundException(`Курсу з ід "${id}" не знайдено`);
      }
      await this.courseModel.findByIdAndUpdate(
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
            'An error occurred while processing the course',
          error: error.response?.error || 'Internal Server Error',
        },
        error.status || 500,
        {
          cause: error,
        },
      );
    }
  }

  async getCourseList() {
    try {
      return await this.courseModel.aggregate([
        {
          $match: {
            // toDelete: false,
            status: 'PUBLISHED',
            $or: [
              { 'access.type': 'PERMANENT' },
              { 'access.type': 'FOR_PERIOD' },
              {
                $and: [
                  { 'access.type': 'TO_DATE' },
                  { 'access.dateStart': { $lte: new Date() } },
                  { 'access.dateEnd': { $gte: new Date() } },
                ],
              },
            ],
          },
        },
        {
          $project: {
            id: '$_id',
            name: 1,
            _id: 0,
          },
        },
      ]);
    } catch (error) {
      throw new InternalServerErrorException(
        'Не вдалося отримати список курсів',
      );
    }
  }
}
