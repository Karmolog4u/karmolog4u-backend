import { ModuleService } from './module.service';
import { ModuleController } from './module.controller';
import { Module } from '@nestjs/common';
import { Module as Modules, ModuleSchema } from './schemas/module.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { CourseModule } from '../course/course.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Modules.name, schema: ModuleSchema }]),
    CourseModule,
  ],
  controllers: [ModuleController],
  providers: [ModuleService],
  exports: [MongooseModule],
})
export class ModuleModule {}
