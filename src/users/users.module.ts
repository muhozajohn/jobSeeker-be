import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { SendEmailService } from 'src/send-email/send-email.service';

@Module({
  imports: [PrismaModule],
  controllers: [UsersController],
  providers: [UsersService,SendEmailService],
  exports: [UsersService],
})
export class UsersModule { }
