import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { WorkerService } from './worker.service';
import { CreateWorkerDto } from './dto/create-worker.dto';
import { UpdateWorkerDto } from './dto/update-worker.dto';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';


@ApiTags('Worker')
@ApiBearerAuth()
@Controller('worker')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WorkerController {
  constructor(private readonly workerService: WorkerService) {}

@Post()
@Roles(Role.WORKER , Role.ADMIN)
@ApiOperation({ summary: 'Create a worker profile' })
@ApiBody({ type: CreateWorkerDto })
@ApiResponse({ status: 201, description: 'Worker profile created successfully'})
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
@ApiResponse({ status: 403, description: 'Forbidden' })
@ApiResponse({ status: 409, description: 'Worker profile already exists for this user' })
async create(@Req() req, @Body() createWorkerDto: CreateWorkerDto) {
  // Use the userId from DTO if provided, otherwise use the authenticated user's ID
  const userId = createWorkerDto.userId ?? req.user.id;
  return this.workerService.create(createWorkerDto, userId);
}

  @Get()
  @Roles(Role.ADMIN , Role.RECRUITER)
  @ApiOperation({ summary: 'Get all worker profiles (Admin , Recruiter only)' })
  @ApiResponse({ status: 200, description: 'List of all workers' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findAll() {
    return this.workerService.findAll();
  }

  @Get('me')
  @Roles(Role.WORKER)
  @ApiOperation({ summary: 'Get current worker profile' })
  @ApiResponse({ status: 200, description: 'Worker profile',  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Worker profile not found' })
  async findMe(@Req() req) {
    return this.workerService.findByUserId(req.user.id);
  }

  @Get(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get worker profile by ID (Admin only)' })
  @ApiParam({ name: 'id', description: 'Worker ID' })
  @ApiResponse({ status: 200, description: 'Worker profile',  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Worker not found' })
  async findOne(@Param('id') id: string) {
    return this.workerService.findOne(+id);
  }

  @Patch('me')
  @Roles(Role.WORKER)
  @ApiOperation({ summary: 'Update current worker profile' })
  @ApiBody({ type: UpdateWorkerDto })
  @ApiResponse({ status: 200, description: 'Worker updated successfully',  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Worker not found' })
  async updateMe(@Req() req, @Body() updateWorkerDto: UpdateWorkerDto) {
    // First get the worker ID for the current user
    const worker = await this.workerService.findByUserId(req.user.id);
    if (worker.statusCode !== 200) {
      return worker;
    }
    return this.workerService.update(worker.data.id, updateWorkerDto);
  }

  @Patch(':id')
  @Roles(Role.ADMIN , Role.WORKER)
  @ApiOperation({ summary: 'Update worker profile by ID (Admin only)' })
  @ApiParam({ name: 'id', description: 'Worker ID' })
  @ApiBody({ type: UpdateWorkerDto })
  @ApiResponse({ status: 200, description: 'Worker updated successfully',  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Worker not found' })
  async update(@Param('id') id: string, @Body() updateWorkerDto: UpdateWorkerDto) {
    return this.workerService.update(+id, updateWorkerDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete worker profile by ID (Admin only)' })
  @ApiParam({ name: 'id', description: 'Worker ID' })
  @ApiResponse({ status: 200, description: 'Worker deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Worker not found' })
  async remove(@Param('id') id: string) {
    return this.workerService.remove(+id);
  }

  @Patch('me/toggle-availability')
  @Roles(Role.WORKER)
  @ApiOperation({ summary: 'Toggle current worker availability' })
  @ApiResponse({ status: 200, description: 'Availability updated successfully',  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Worker not found' })
  async toggleAvailability(@Req() req) {
    // First get the worker ID for the current user
    const worker = await this.workerService.findByUserId(req.user.id);
    if (worker.statusCode !== 200) {
      return worker;
    }
    return this.workerService.toggleAvailability(worker.data.id);
  }
}