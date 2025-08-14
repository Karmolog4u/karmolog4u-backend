import { MongooseModule } from '@nestjs/mongoose';
import { FilesService } from './files.service';
import { Module } from '@nestjs/common';
import { Files, FilesSchema } from './schemas/files.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Files.name, schema: FilesSchema }]),
  ],
  controllers: [],
  providers: [FilesService],
  exports: [FilesService],
})
export class FilesModule {}
