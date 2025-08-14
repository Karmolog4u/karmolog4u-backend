import { CourseService } from './course.service';
import { CourseController } from './course.controller';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Course, CourseSchema } from './schemas/course.schema';
import { ContractModule } from '../contract/contract.module';
import { StorageModule } from 'src/storage/storage.module';
import { FilesModule } from 'src/files/files.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Course.name, schema: CourseSchema }]),
    ContractModule,
    StorageModule,
    FilesModule,
  ],
  controllers: [CourseController],
  providers: [CourseService],
  exports: [CourseService, MongooseModule],
})
export class CourseModule {}
