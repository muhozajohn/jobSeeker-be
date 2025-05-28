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
  UseGuards,
  Request
} from '@nestjs/common';
import { JobService } from './job.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';


@ApiTags('Jobs')
@Controller('jobs')
export class JobController {
  constructor(private readonly jobService: JobService) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new job' })
  @ApiResponse({ status: 201, description: 'Job created successfully' })
  @ApiResponse({ status: 404, description: 'Category or recruiter not found' })
  create(@Body() createJobDto: CreateJobDto) {
    return this.jobService.create(createJobDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all jobs' })
  @ApiQuery({ name: 'activeOnly', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'Jobs retrieved successfully' })
  findAll(@Query('activeOnly') activeOnly: string) {
    const showActiveOnly = activeOnly === 'false' ? false : true;
    return this.jobService.findAll(showActiveOnly);
  }

  @Get('myjobs')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all jobs posted by me' })
  @ApiQuery({
    name: 'activeOnly',
    required: false,
    type: Boolean,
    description: 'Filter by active status. true=active only, false=inactive only, undefined=all jobs'
  })
  @ApiResponse({ status: 200, description: 'Jobs retrieved successfully' })
  findAllMyJobs(
    @Query('activeOnly') activeOnly: string,
    @Request() req
  ) {

    let showActiveOnly: boolean | undefined;

    if (activeOnly === 'true') {
      showActiveOnly = true;
    } else if (activeOnly === 'false') {
      showActiveOnly = false;
    }


    const recruiterId = req.user.id;
    return this.jobService.findAllPostedByMe(showActiveOnly, recruiterId);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a job by ID' })
  @ApiResponse({ status: 200, description: 'Job retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  findOne(@Param('id') id: string) {
    return this.jobService.findOne(+id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a job' })
  @ApiResponse({ status: 200, description: 'Job updated successfully' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  update(@Param('id') id: string, @Body() updateJobDto: UpdateJobDto) {
    return this.jobService.update(+id, updateJobDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a job' })
  @ApiResponse({ status: 200, description: 'Job deleted successfully' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  @ApiResponse({ status: 400, description: 'Cannot delete job with existing applications or assignments' })
  remove(@Param('id') id: string) {
    return this.jobService.remove(+id);
  }

  @Patch(':id/toggle-active')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Toggle job active status' })
  @ApiResponse({ status: 200, description: 'Job status toggled successfully' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  toggleActiveStatus(@Param('id') id: string) {
    return this.jobService.toggleActiveStatus(+id);
  }
}