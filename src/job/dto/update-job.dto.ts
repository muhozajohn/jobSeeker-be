import { PartialType } from '@nestjs/mapped-types';
import { CreateJobDto } from './create-job.dto';
import { IsString, IsOptional,  IsBoolean, IsEnum } from 'class-validator';
import { SalaryType } from '@prisma/client';

export class UpdateJobDto extends PartialType(CreateJobDto) {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(SalaryType)
  @IsOptional()
  salaryType?: SalaryType;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}