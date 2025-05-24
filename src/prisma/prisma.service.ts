import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit(): Promise<void> {
    try {
      await this.$connect();
      this.logger.log('✅ Connected to PostgreSQL DbVia via Prisma.');
    } catch (error) {
      this.logger.error('❌ Prisma connection failed.', error);
      throw error;
    }
  }

  async onModuleDestroy(): Promise<void> {
    try {
      await this.$disconnect();
      this.logger.log('🛑 Prisma disconnected cleanly.');
    } catch (error) {
      this.logger.error('⚠️ Prisma disconnection error.', error);
    }
  }
}