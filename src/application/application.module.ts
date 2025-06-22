import { Module } from '@nestjs/common';
import { ApplicationService } from './application.service';
import { ApplicationController } from './application.controller';
import { SendEmailService } from 'src/send-email/send-email.service';

@Module({
  controllers: [ApplicationController],
  providers: [ApplicationService,SendEmailService],
})
export class ApplicationModule {}
