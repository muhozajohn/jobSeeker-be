import { Module } from '@nestjs/common';
import { JobCategoryService } from './job-category.service';
import { JobCategoryController } from './job-category.controller';

@Module({
  controllers: [JobCategoryController],
  providers: [JobCategoryService],
})
export class JobCategoryModule {}
