import { LessonService } from './lesson.service';
import { LessonController } from './lesson.controller';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Lesson, LessonSchema } from './schemas/lesson.schema';
import { FilesModule } from 'src/files/files.module';
import { StorageModule } from 'src/storage/storage.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Lesson.name, schema: LessonSchema }]),
    StorageModule,
    FilesModule,
  ],
  controllers: [LessonController],
  providers: [LessonService],
  exports: [LessonService, MongooseModule],
})
export class LessonModule {}
