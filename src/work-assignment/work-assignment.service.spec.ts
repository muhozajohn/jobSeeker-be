import { Test, TestingModule } from '@nestjs/testing';
import { WorkAssignmentService } from './work-assignment.service';

describe('WorkAssignmentService', () => {
  let service: WorkAssignmentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WorkAssignmentService],
    }).compile();

    service = module.get<WorkAssignmentService>(WorkAssignmentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
