import { IsString, IsOptional, IsBoolean, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateWorkerDto {
//   @ApiProperty({
//     example: 1,
//     description: 'User ID associated with the worker profile',
//   })
//   @IsInt()
//   userId?: number;

  @ApiProperty({
    example: 'New York, USA',
    description: 'Location of the worker',
    required: false,
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({
    example: '5 years of experience in web development',
    description: 'Work experience details',
    required: false,
  })
  @IsOptional()
  @IsString()
  experience?: string;

  @ApiProperty({
    example: 'JavaScript, React, Node.js, TypeScript',
    description: 'Skills possessed by the worker',
    required: false,
  })
  @IsOptional()
  @IsString()
  skills?: string;

  @ApiProperty({
    example: 'https://example.com/resumes/john-doe.pdf',
    description: 'URL or path to the worker\'s resume',
    required: false,
  })
  @IsOptional()
  @IsString()
  resume?: string;

  @ApiProperty({
    example: true,
    description: 'Availability status of the worker',
    required: false,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  available?: boolean;
  userId: number;
}