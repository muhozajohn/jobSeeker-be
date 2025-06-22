import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsInt, IsEnum, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SalaryType } from '@prisma/client';

export class UpdateJobDto {
  @ApiProperty({
    example: 'Math Teacher',
    description: 'The title of the job position',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: 'Responsible for teaching math to high school students.',
    description: 'Detailed description of the job responsibilities',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    example: 'Kigali, Rwanda',
    description: 'Location where the job is based',
    required: false,
  })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty({
    example: 500000,
    description: 'Monthly salary offered for the job in Rwandan Francs',
    required: false,
  })
  @IsInt()
  @IsOptional()
  salary?: number;

  @ApiProperty({
    example: SalaryType.MONTHLY,
    enum: SalaryType,
    description: 'Type of salary payment (e.g., HOURLY, WEEKLY, MONTHLY)',
    required: false,
  })
  @IsEnum(SalaryType)
  @IsOptional()
  salaryType?: SalaryType;

  @ApiProperty({
    example: 'Bachelor’s degree in Education, 2+ years teaching experience',
    description: 'Job qualifications or requirements',
    required: false,
  })
  @IsString()
  @IsOptional()
  requirements?: string;

  @ApiProperty({
    example: '8 AM - 4 PM',
    description: 'Working hours for the job',
    required: false,
  })
  @IsString()
  @IsOptional()
  workingHours?: string;

  @ApiProperty({
    example: true,
    description: 'Whether the job is currently active and visible to applicants',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({
    example: false,
    description: 'Indicates if multiple people can be hired for this position',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  allowMultiple?: boolean;

  @ApiProperty({
    example: true,
    description: 'Indicates if job is urgent',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  urgent?: boolean;

  @ApiProperty({
    example: 1,
    description: 'ID of the job category',
    required: false,
  })
  @IsInt()
  @IsNotEmpty()
  categoryId: number;

  // @ApiProperty({
  //   example: 2,
  //   description: 'ID of the recruiter creating the job posting',
  //   required: true,
  // })
  // @IsInt()
  // @IsNotEmpty()
  // recruiterId: number;

  @ApiProperty({
    example: ['Communication', 'Teamwork', 'Mathematics'],
    description: 'List of skills required for the job',
    required: false,
    isArray: true,
    type: String,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  skills?: string[];
}

