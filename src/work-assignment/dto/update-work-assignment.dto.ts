import { PartialType } from '@nestjs/swagger';
import { CreateWorkAssignmentDto } from './create-work-assignment.dto';

export class UpdateWorkAssignmentDto extends PartialType(CreateWorkAssignmentDto) {}
