import { Test, TestingModule } from '@nestjs/testing';
import { JobCategoryService } from './job-category.service';

describe('JobCategoryService', () => {
  let service: JobCategoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JobCategoryService],
    }).compile();

    service = module.get<JobCategoryService>(JobCategoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
