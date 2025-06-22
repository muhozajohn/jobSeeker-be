import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CloudinaryModule } from './utils/cloudinary.module';
import { UtilsModule } from './utils/utils.module';
import { RecruiterModule } from './recruiter/recruiter.module';
import { WorkerModule } from './worker/worker.module';
import { JobCategoryModule } from './job-category/job-category.module';
import { JobModule } from './job/job.module';
import { ApplicationModule } from './application/application.module';
import { WorkAssignmentModule } from './work-assignment/work-assignment.module';
import { SendEmailService } from './send-email/send-email.service';



@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true,
  }), PrismaModule, AuthModule, UsersModule, CloudinaryModule, UtilsModule , AuthModule, RecruiterModule, WorkerModule, JobCategoryModule, JobModule, ApplicationModule, WorkAssignmentModule],
  controllers: [AppController],
  providers: [AppService, SendEmailService],
})
export class AppModule { }
