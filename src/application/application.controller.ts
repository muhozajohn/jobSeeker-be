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
import { ApplicationService } from './application.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ApplicationStatus } from '@prisma/client';

@ApiTags('Applications')
@Controller('applications')
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new application' })
  @ApiResponse({ status: 201, description: 'Application created successfully' })
  @ApiResponse({ status: 404, description: 'Job or worker not found' })
  @ApiResponse({ status: 409, description: 'Application already exists for this job and worker' })
  create(@Body() createApplicationDto: CreateApplicationDto) {
    return this.applicationService.create(createApplicationDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all applications' })
  @ApiResponse({ status: 200, description: 'Applications retrieved successfully' })
  findAll() {
    return this.applicationService.findAll();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get an application by ID' })
  @ApiResponse({ status: 200, description: 'Application retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Application not found' })
  findOne(@Param('id') id: string) {
    return this.applicationService.findOne(+id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update an application' })
  @ApiResponse({ status: 200, description: 'Application updated successfully' })
  @ApiResponse({ status: 404, description: 'Application not found' })
  @ApiResponse({ status: 409, description: 'Application already exists for this job and worker' })
  update(@Param('id') id: string, @Body() updateApplicationDto: UpdateApplicationDto) {
    return this.applicationService.update(+id, updateApplicationDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete an application' })
  @ApiResponse({ status: 200, description: 'Application deleted successfully' })
  @ApiResponse({ status: 404, description: 'Application not found' })
  remove(@Param('id') id: string) {
    return this.applicationService.remove(+id);
  }

  @Get('job/:jobId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get applications by job ID' })
  @ApiResponse({ status: 200, description: 'Applications retrieved successfully' })
  findByJob(@Param('jobId') jobId: string) {
    return this.applicationService.findByJob(+jobId);
  }

  @Get('worker/:workerId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get applications by worker ID' })
  @ApiResponse({ status: 200, description: 'Applications retrieved successfully' })
  findByWorker(@Param('workerId') workerId: string) {
    return this.applicationService.findByWorker(+workerId);
  }

  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update application status' })
  @ApiQuery({ name: 'status', enum: ApplicationStatus })
  @ApiResponse({ status: 200, description: 'Application status updated successfully' })
  @ApiResponse({ status: 404, description: 'Application not found' })
  updateStatus(
    @Param('id') id: string,
    @Query('status') status: ApplicationStatus,
  ) {
    return this.applicationService.updateStatus(+id, status);
  }
}