import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  Query,
  ParseIntPipe,
  HttpStatus,
  
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiConsumes, 
  ApiBody, 
  ApiParam, 
  ApiQuery 
} from '@nestjs/swagger';
import { Role, Prisma } from '@prisma/client';
import { 
  CreateUserDto,
  UpdateUserDto,
  UpdateRoleDto,
  UserResponseDto,
  PaginatedUsersResponseDto
} from './dto/create-user.dto';
import { ServiceResponse } from '../utils/response.utils';
import { Roles } from '../auth/roles.decorator';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

@Post()
@UseInterceptors(FileInterceptor('avatar')) 
@ApiOperation({ summary: 'Create a new user' })
@ApiResponse({ 
  status: HttpStatus.CREATED, 
  description: 'User successfully created',
  type: UserResponseDto 
})
@ApiResponse({ 
  status: HttpStatus.CONFLICT, 
  description: 'Email already exists' 
})
@ApiResponse({ 
  status: HttpStatus.BAD_REQUEST, 
  description: 'Invalid input data' 
})
@ApiConsumes('multipart/form-data') 
@ApiBody({ 
  type: CreateUserDto,
  description: 'User data with optional avatar file'
})
async create(
  @Body() createUserDto: CreateUserDto,
  @UploadedFile() file?: Express.Multer.File, 
): Promise<ServiceResponse> {
  return this.usersService.create(
    {
      email: createUserDto.email,
      password: createUserDto.password,
      firstName: createUserDto.firstName,
      lastName: createUserDto.lastName,
      phone: createUserDto.phone,
      avatar: createUserDto.avatar,
      role: createUserDto.role,
      isActive: createUserDto.isActive ?? true,
    },
    file 
  );
}

  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get all users with pagination and filtering' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Returns paginated list of users',
    type: PaginatedUsersResponseDto 
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10)' })
  @ApiQuery({ name: 'role', required: false, enum: Role, description: 'Filter by user role' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean, description: 'Filter by active status' })
  @ApiQuery({ name: 'includeRelations', required: false, type: Boolean, description: 'Include user relationships' })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('role') role?: Role,
    @Query('isActive') isActive?: boolean,
    @Query('includeRelations') includeRelations?: boolean,
  ): Promise<ServiceResponse> {
    const skip = (page || 1) > 0 ? ((page || 1) - 1) * (limit || 10) : undefined;
    const take = limit && limit > 0 ? limit : undefined;
    const where: Prisma.UserWhereInput = {};

    if (role) {
      where.role = role;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    return this.usersService.findAll(
      skip,
      take,
      { createdAt: 'desc' },
      where,
      Boolean(includeRelations),
    );
  }

  @Get('search')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Search users by name or email' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Returns search results',
    type: PaginatedUsersResponseDto 
  })
  @ApiQuery({ name: 'query', required: true, type: String, description: 'Search query' })
  @ApiQuery({ name: 'role', required: false, enum: Role, description: 'Filter by role' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean, description: 'Filter by active status' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  async searchUsers(
    @Query('query') query: string,
    @Query('role') role?: Role,
    @Query('isActive') isActive?: boolean,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<ServiceResponse> {
    const skip = (page || 1) > 0 ? ((page || 1) - 1) * (limit || 10) : undefined;
    const take = limit && limit > 0 ? limit : undefined;

    return this.usersService.searchUsers(query, role, isActive, skip, take);
  }

  @Get('recruiters')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get all recruiters' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Returns list of recruiters' 
  })
  @ApiQuery({ name: 'includeJobs', required: false, type: Boolean, description: 'Include job data' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  async getRecruiters(
    @Query('includeJobs') includeJobs?: boolean,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<ServiceResponse> {
    const skip = (page || 1) > 0 ? ((page || 1) - 1) * (limit || 10) : undefined;
    const take = limit && limit > 0 ? limit : undefined;

    return this.usersService.findRecruiters(skip, take, Boolean(includeJobs));
  }

  @Get('workers')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get all workers' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Returns list of workers' 
  })
  @ApiQuery({ name: 'includeApplications', required: false, type: Boolean, description: 'Include application data' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  async getWorkers(
    @Query('includeApplications') includeApplications?: boolean,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<ServiceResponse> {
    const skip = (page || 1) > 0 ? ((page || 1) - 1) * (limit || 10) : undefined;
    const take = limit && limit > 0 ? limit : undefined;

    return this.usersService.findWorkers(skip, take, Boolean(includeApplications));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Returns the user',
    type: UserResponseDto 
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'User not found' 
  })
  @ApiParam({ name: 'id', type: Number, description: 'User ID' })
  @ApiQuery({ name: 'includeRelations', required: false, type: Boolean, description: 'Include user relationships' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Query('includeRelations') includeRelations?: boolean,
  ): Promise<ServiceResponse> {
    return this.usersService.findOne(id, Boolean(includeRelations));
  }

  @Get(':id/jobs')
  @ApiOperation({ summary: 'Get jobs created by recruiter' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Returns user jobs' 
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'User not found' 
  })
  @ApiResponse({ 
    status: HttpStatus.FORBIDDEN, 
    description: 'User is not a recruiter' 
  })
  @ApiParam({ name: 'id', type: Number, description: 'User ID' })
  async getUserJobs(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ServiceResponse> {
    return this.usersService.getUserJobs(id);
  }

  @Get(':id/applications')
  @ApiOperation({ summary: 'Get applications submitted by worker' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Returns user applications' 
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'User not found' 
  })
  @ApiResponse({ 
    status: HttpStatus.FORBIDDEN, 
    description: 'User is not a worker' 
  })
  @ApiParam({ name: 'id', type: Number, description: 'User ID' })
  async getUserApplications(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ServiceResponse> {
    return this.usersService.getUserApplications(id);
  }

  @Get(':id/work-assignments')
  @ApiOperation({ summary: 'Get work assignments for user' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Returns work assignments (different view for workers vs recruiters)' 
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'User not found' 
  })
  @ApiResponse({ 
    status: HttpStatus.FORBIDDEN, 
    description: 'User must be a worker or recruiter' 
  })
  @ApiParam({ name: 'id', type: Number, description: 'User ID' })
  async getUserWorkAssignments(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ServiceResponse> {
    return this.usersService.getUserWorkAssignments(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user information' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'User successfully updated',
    type: UserResponseDto 
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'User not found' 
  })
  @ApiResponse({ 
    status: HttpStatus.CONFLICT, 
    description: 'Email already exists' 
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UpdateUserDto })
  @UseInterceptors(FileInterceptor('avatar'))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<ServiceResponse> {
    return this.usersService.update(id, updateUserDto, file);
  }

  @Patch(':id/avatar')
  @ApiOperation({ summary: 'Update user avatar' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Avatar successfully updated' 
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'User not found' 
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Invalid file format' 
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        avatar: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('avatar'))
  async updateAvatar(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ServiceResponse> {
    return this.usersService.updateAvatar(id, file);
  }

  @Patch(':id/role')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update user role' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'User role successfully updated' 
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'User not found' 
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Invalid role' 
  })
  @ApiParam({ name: 'id', type: Number, description: 'User ID' })
  @ApiBody({ type: UpdateRoleDto })
  async updateRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRoleDto: UpdateRoleDto,
  ): Promise<ServiceResponse> {
    return this.usersService.updateRole(id, updateRoleDto.role);
  }

  @Patch(':id/status')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Toggle user active status' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'User status successfully toggled' 
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'User not found' 
  })
  @ApiParam({ name: 'id', type: Number, description: 'User ID' })
  async toggleUserStatus(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ServiceResponse> {
    return this.usersService.toggleUserStatus(id);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete user' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'User successfully deleted' 
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'User not found' 
  })
  @ApiParam({ name: 'id', type: Number, description: 'User ID' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<ServiceResponse> {
    return this.usersService.remove(id);
  }
}