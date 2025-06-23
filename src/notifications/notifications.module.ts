import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { SendEmailService } from 'src/send-email/send-email.service';

@Module({
  controllers: [NotificationsController],
  providers: [NotificationsService,SendEmailService],
})
export class NotificationsModule {}
