import { Module } from '@nestjs/common';
import { WorkAssignmentService } from './work-assignment.service';
import { WorkAssignmentController } from './work-assignment.controller';
import { SendEmailService } from 'src/send-email/send-email.service';

@Module({
  controllers: [WorkAssignmentController],
  providers: [WorkAssignmentService, SendEmailService],
})
export class WorkAssignmentModule {}
