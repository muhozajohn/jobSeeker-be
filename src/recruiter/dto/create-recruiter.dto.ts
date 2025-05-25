import { IsString, IsOptional, IsEnum, IsUrl, IsBoolean, IsEmail, MinLength } from 'class-validator';
import { RecruiterType } from '@prisma/client';

export class CreateRecruiterDto {
  // User fields
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsUrl()
  @IsOptional()
  avatar?: string;

  // Recruiter fields
  @IsString()
  @IsOptional()
  companyName?: string;

  @IsEnum(RecruiterType)
  type: RecruiterType;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsUrl()
  @IsOptional()
  website?: string;

  @IsBoolean()
  @IsOptional()
  verified?: boolean;
}