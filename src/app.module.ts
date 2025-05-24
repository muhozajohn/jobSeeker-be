import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CloudinaryModule } from './utils/cloudinary.module';
import { UtilsModule } from './utils/utils.module';



@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true,
  }), PrismaModule, AuthModule, UsersModule, CloudinaryModule, UtilsModule , AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
