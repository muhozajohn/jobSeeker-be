import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { WorkAssignmentService } from './work-assignment.service';
import { CreateWorkAssignmentDto } from './dto/create-work-assignment.dto';
import { UpdateWorkAssignmentDto } from './dto/update-work-assignment.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { AssignmentStatus } from '@prisma/client';

@ApiTags('Work Assignments')
@Controller('work-assignments')
export class WorkAssignmentController {
  constructor(private readonly workAssignmentService: WorkAssignmentService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new work assignment' })
  @ApiResponse({ status: 201, description: 'Work assignment created successfully' })
  @ApiResponse({ status: 404, description: 'Job, worker or recruiter not found' })
  @ApiResponse({ status: 409, description: 'Worker already assigned to this job on the specified date' })
  create(@Body() createWorkAssignmentDto: CreateWorkAssignmentDto) {
    return this.workAssignmentService.create(createWorkAssignmentDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all work assignments' })
  @ApiResponse({ status: 200, description: 'Work assignments retrieved successfully' })
  findAll() {
    return this.workAssignmentService.findAll();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a work assignment by ID' })
  @ApiResponse({ status: 200, description: 'Work assignment retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Work assignment not found' })
  findOne(@Param('id') id: string) {
    return this.workAssignmentService.findOne(+id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a work assignment' })
  @ApiResponse({ status: 200, description: 'Work assignment updated successfully' })
  @ApiResponse({ status: 404, description: 'Work assignment not found' })
  update(@Param('id') id: string, @Body() updateWorkAssignmentDto: UpdateWorkAssignmentDto) {
    return this.workAssignmentService.update(+id, updateWorkAssignmentDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a work assignment' })
  @ApiResponse({ status: 200, description: 'Work assignment deleted successfully' })
  @ApiResponse({ status: 404, description: 'Work assignment not found' })
  remove(@Param('id') id: string) {
    return this.workAssignmentService.remove(+id);
  }

  @Get('worker/:workerId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get work assignments by worker ID' })
  @ApiResponse({ status: 200, description: 'Worker assignments retrieved successfully' })
  findByWorker(@Param('workerId') workerId: string) {
    return this.workAssignmentService.findByWorker(+workerId);
  }

  @Get('job/:jobId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get work assignments by job ID' })
  @ApiResponse({ status: 200, description: 'Job assignments retrieved successfully' })
  findByJob(@Param('jobId') jobId: string) {
    return this.workAssignmentService.findByJob(+jobId);
  }

  @Get('recruiter/:recruiterId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get work assignments by recruiter ID' })
  @ApiResponse({ status: 200, description: 'Recruiter assignments retrieved successfully' })
  findByRecruiter(@Param('recruiterId') recruiterId: string) {
    return this.workAssignmentService.findByRecruiter(+recruiterId);
  }

  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update work assignment status' })
  @ApiQuery({ name: 'status', enum: AssignmentStatus })
  @ApiResponse({ status: 200, description: 'Work assignment status updated successfully' })
  @ApiResponse({ status: 404, description: 'Work assignment not found' })
  updateStatus(
    @Param('id') id: string,
    @Query('status') status: AssignmentStatus,
  ) {
    return this.workAssignmentService.updateStatus(+id, status);
  }
}