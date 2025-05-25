import { Test, TestingModule } from '@nestjs/testing';
import { JobCategoryController } from './job-category.controller';
import { JobCategoryService } from './job-category.service';

describe('JobCategoryController', () => {
  let controller: JobCategoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JobCategoryController],
      providers: [JobCategoryService],
    }).compile();

    controller = module.get<JobCategoryController>(JobCategoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
