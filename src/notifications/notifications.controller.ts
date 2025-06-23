
import { Controller, Post, Body, Get, Param, Put, UseGuards } from '@nestjs/common';
import { ConnectionStatus, Role } from '@prisma/client';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';

class CreateConnectionRequestDto {
  recruiterId: number;
  workerId: number;
  message?: string;
}

class UpdateConnectionStatusDto {
  status: ConnectionStatus;
  adminNotes?: string;
}

@ApiTags('Connection Requests')
@ApiBearerAuth()
@Controller('connection-requests')
export class NotificationsController {
  constructor(
    private readonly connectionRequestsService: NotificationsService
  ) {}

  @Post()
  @Roles(Role.ADMIN , Role.RECRUITER)
  @ApiOperation({ summary: 'Create a new connection request' })
  @ApiResponse({ status: 201, description: 'Request created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'Request already exists' })
  async create(@Body() createDto: CreateConnectionRequestDto) {
    return this.connectionRequestsService.createConnectionRequest(
      createDto.recruiterId,
      createDto.workerId,
      createDto.message
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN , Role.RECRUITER)
  @ApiOperation({ summary: 'Get all connection requests (Admin only)' })
  @ApiResponse({ status: 200, description: 'List of connection requests' })
  async findAll() {
    return this.connectionRequestsService.getConnectionRequests({});
  }

@Put(':id/status')
 @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update connection request status (Admin only)' })
  @ApiResponse({ status: 200, description: 'Status updated successfully' })
  @ApiResponse({ status: 404, description: 'Request not found' })
  async updateStatus(
    @Param('id') id: string,
    @Body() updateDto: UpdateConnectionStatusDto
  ) {
    return this.connectionRequestsService.updateConnectionStatus(
      parseInt(id),
      updateDto.status,
      updateDto.adminNotes
    );
  }
}