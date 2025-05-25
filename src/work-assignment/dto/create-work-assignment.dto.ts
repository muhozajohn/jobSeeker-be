import { IsDate, IsInt, IsNotEmpty, IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AssignmentStatus } from '@prisma/client';

export class CreateWorkAssignmentDto {
  @ApiProperty({
    example: '2025-06-01T08:00:00Z',
    description: 'Optional start time for the work assignment',
    required: false,
  })
//   @IsDate()
  @IsOptional()
  startTime?: Date;

  @ApiProperty({
    example: '2025-06-01T16:00:00Z',
    description: 'Optional end time for the work assignment',
    required: false,
  })
//   @IsDate()
  @IsOptional()
  endTime?: Date;

  @ApiProperty({
    example: '2025-06-01T00:00:00Z',
    description: 'The specific date the work is scheduled for',
    required: true,
  })
//   @IsDate()
  @IsNotEmpty()
  workDate: Date;

  @ApiProperty({
    example: AssignmentStatus.ACTIVE,
    enum: AssignmentStatus,
    description: 'Status of the work assignment (e.g., PENDING, COMPLETED, CANCELLED)',
    required: false,
  })
  @IsEnum(AssignmentStatus)
  @IsOptional()
  status?: AssignmentStatus;

  @ApiProperty({
    example: 'Bring all required materials and report to the front desk.',
    description: 'Additional notes for the worker regarding the assignment',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({
    example: 3,
    description: 'ID of the job associated with this assignment',
    required: true,
  })
  @IsInt()
  @IsNotEmpty()
  jobId: number;

  @ApiProperty({
    example: 8,
    description: 'ID of the worker assigned to this job',
    required: true,
  })
  @IsInt()
  @IsNotEmpty()
  workerId: number;

  @ApiProperty({
    example: 2,
    description: 'ID of the recruiter assigning the work',
    required: true,
  })
  @IsInt()
  @IsNotEmpty()
  recruiterId: number;
}
