import { PartialType } from '@nestjs/mapped-types';
import { CreateRecruiterDto } from './create-recruiter.dto';
import { IsInt, IsOptional } from 'class-validator';

export class UpdateRecruiterDto extends PartialType(CreateRecruiterDto) {
  @IsInt()
  @IsOptional()
  userId?: number;
}