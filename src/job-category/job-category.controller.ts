import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JobCategoryService } from './job-category.service';
import { CreateJobCategoryDto } from './dto/create-job-category.dto';
import { UpdateJobCategoryDto } from './dto/update-job-category.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Job Categories')
@Controller('job-categories')
export class JobCategoryController {
  constructor(private readonly jobCategoryService: JobCategoryService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new job category' })
  @ApiResponse({ status: 201, description: 'Job category created successfully' })
  @ApiResponse({ status: 409, description: 'Job category with this name already exists' })
  create(@Body() createJobCategoryDto: CreateJobCategoryDto) {
    return this.jobCategoryService.create(createJobCategoryDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all job categories' })
  @ApiResponse({ status: 200, description: 'Job categories retrieved successfully' })
  findAll() {
    return this.jobCategoryService.findAll();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a job category by ID' })
  @ApiResponse({ status: 200, description: 'Job category retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Job category not found' })
  findOne(@Param('id') id: string) {
    return this.jobCategoryService.findOne(+id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a job category' })
  @ApiResponse({ status: 200, description: 'Job category updated successfully' })
  @ApiResponse({ status: 404, description: 'Job category not found' })
  @ApiResponse({ status: 409, description: 'Job category with this name already exists' })
  update(@Param('id') id: string, @Body() updateJobCategoryDto: UpdateJobCategoryDto) {
    return this.jobCategoryService.update(+id, updateJobCategoryDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a job category' })
  @ApiResponse({ status: 200, description: 'Job category deleted successfully' })
  @ApiResponse({ status: 404, description: 'Job category not found' })
  @ApiResponse({ status: 400, description: 'Cannot delete job category as it is referenced by other records' })
  remove(@Param('id') id: string) {
    return this.jobCategoryService.remove(+id);
  }
}