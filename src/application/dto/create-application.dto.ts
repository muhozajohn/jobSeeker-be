import { IsString, IsOptional, IsInt, IsNotEmpty, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ApplicationStatus } from '@prisma/client';

export class CreateApplicationDto {
  @ApiProperty({
    example: 'I am very interested in this position and believe I meet all the qualifications.',
    description: 'Optional message from the applicant to the recruiter',
    required: false,
  })
  @IsString()
  @IsOptional()
  message?: string;

  @ApiProperty({
    example: 1,
    description: 'The ID of the job being applied for',
    required: true,
  })
  @IsInt()
  @IsNotEmpty()
  jobId: number;

  @ApiProperty({
    example: 5,
    description: 'The ID of the worker (user) applying for the job',
    required: true,
  })
  @IsInt()
  @IsNotEmpty()
  workerId: number;

  @ApiProperty({
    example: ApplicationStatus.PENDING,
    enum: ApplicationStatus,
    description: 'The current status of the application',
    required: false,
  })
  @IsEnum(ApplicationStatus)
  @IsOptional()
  status?: ApplicationStatus;
}
