import { Module } from '@nestjs/common';
import { RecruiterService } from './recruiter.service';
import { RecruiterController } from './recruiter.controller';
import { SendEmailService } from '../send-email/send-email.service';

@Module({
  controllers: [RecruiterController],
  providers: [RecruiterService,SendEmailService],
})
export class RecruiterModule {}
