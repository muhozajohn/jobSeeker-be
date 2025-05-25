import { Test, TestingModule } from '@nestjs/testing';
import { WorkAssignmentController } from './work-assignment.controller';
import { WorkAssignmentService } from './work-assignment.service';

describe('WorkAssignmentController', () => {
  let controller: WorkAssignmentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkAssignmentController],
      providers: [WorkAssignmentService],
    }).compile();

    controller = module.get<WorkAssignmentController>(WorkAssignmentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
