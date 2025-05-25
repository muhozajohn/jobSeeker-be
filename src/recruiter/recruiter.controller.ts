import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  Query,
  ParseIntPipe,
  ValidationPipe,
  HttpStatus
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam, 
  ApiQuery, 
  ApiBody,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
  ApiInternalServerErrorResponse
} from '@nestjs/swagger';
import { RecruiterService } from './recruiter.service';
import { CreateRecruiterDto } from './dto/create-recruiter.dto';
import { UpdateRecruiterDto } from './dto/update-recruiter.dto';
import { RecruiterType } from '@prisma/client';

// Response DTOs for Swagger documentation
class RecruiterResponseDto {
  id: number;
  userId: number;
  companyName?: string;
  type: RecruiterType;
  description?: string;
  location?: string;
  website?: string;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
  };
}

class PaginationDto {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

class RecruiterListResponseDto {
  recruiters: RecruiterResponseDto[];
  pagination: PaginationDto;
}

class RecruiterStatsDto {
  total: number;
  verified: number;
  unverified: number;
  byType: Record<string, number>;
}

class SuccessResponseDto {
  success: boolean;
  message: string;
  data?: any;
}

class ErrorResponseDto {
  success: boolean;
  message: string;
  error?: string;
}

@ApiTags('Recruiters')
@Controller('recruiters')
export class RecruiterController {
  constructor(private readonly recruiterService: RecruiterService) {}

  @Post()
  @ApiOperation({ 
    summary: 'Create a new recruiter and user account',
    description: 'Creates a new user account with RECRUITER role and associated recruiter profile simultaneously.'
  })
  @ApiBody({ 
    type: CreateRecruiterDto,
    description: 'User and recruiter data to create',
    examples: {
      company: {
        summary: 'Company Recruiter',
        value: {
          email: 'john.doe@techcorp.com',
          password: 'securePassword123',
          firstName: 'John',
          lastName: 'Doe',
          phone: '+1-555-0123',
          companyName: 'Tech Corp Inc.',
          type: 'COMPANY',
          description: 'Leading technology company specializing in AI solutions',
          location: 'San Francisco, CA',
          website: 'https://techcorp.com'
        }
      },
      individual: {
        summary: 'Individual Recruiter',
        value: {
          email: 'jane.smith@gmail.com',
          password: 'myPassword456',
          firstName: 'Jane',
          lastName: 'Smith',
          phone: '+1-555-0456',
          type: 'INDIVIDUAL',
          description: 'Freelance technical recruiter specializing in software engineering roles',
          location: 'Remote'
        }
      },
      group: {
        summary: 'Group Recruiter',
        value: {
          email: 'admin@recruitmentgroup.com',
          password: 'groupPass789',
          firstName: 'Mike',
          lastName: 'Johnson',
          companyName: 'Elite Recruitment Group',
          type: 'GROUP',
          description: 'Professional recruitment agency serving Fortune 500 companies',
          location: 'New York, NY',
          website: 'https://eliterecruitment.com'
        }
      }
    }
  })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'Recruiter and user created successfully',
    type: SuccessResponseDto,
    schema: {
      example: {
        success: true,
        message: 'Recruiter and user created successfully',
        data: {
          id: 1,
          userId: 1,
          companyName: 'Tech Corp Inc.',
          type: 'COMPANY',
          description: 'Leading technology company specializing in AI solutions',
          location: 'San Francisco, CA',
          website: 'https://techcorp.com',
          verified: false,
          createdAt: '2024-01-20T10:00:00.000Z',
          updatedAt: '2024-01-20T10:00:00.000Z',
          user: {
            id: 1,
            email: 'john.doe@techcorp.com',
            firstName: 'John',
            lastName: 'Doe',
            phone: '+1-555-0123',
            avatar: null,
            role: 'RECRUITER'
          }
        }
      }
    }
  })
  @ApiBadRequestResponse({ 
    description: 'Invalid input data or validation failed',
    type: ErrorResponseDto
  })
  @ApiConflictResponse({ 
    description: 'User with this email already exists',
    type: ErrorResponseDto
  })
  @ApiInternalServerErrorResponse({ 
    description: 'Internal server error',
    type: ErrorResponseDto
  })
  create(@Body(ValidationPipe) createRecruiterDto: CreateRecruiterDto) {
    return this.recruiterService.create(createRecruiterDto);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Get all recruiters with filtering and pagination',
    description: 'Retrieves a paginated list of recruiters with optional filtering by type, location, verification status, and search term.'
  })
  @ApiQuery({ 
    name: 'page', 
    required: false, 
    type: Number, 
    description: 'Page number (default: 1)',
    example: 1
  })
  @ApiQuery({ 
    name: 'limit', 
    required: false, 
    type: Number, 
    description: 'Items per page (default: 10, max: 100)',
    example: 10
  })
  @ApiQuery({ 
    name: 'type', 
    required: false, 
    enum: RecruiterType,
    description: 'Filter by recruiter type'
  })
  @ApiQuery({ 
    name: 'location', 
    required: false, 
    type: String, 
    description: 'Filter by location (partial match)',
    example: 'San Francisco'
  })
  @ApiQuery({ 
    name: 'verified', 
    required: false, 
    type: Boolean, 
    description: 'Filter by verification status'
  })
  @ApiQuery({ 
    name: 'search', 
    required: false, 
    type: String, 
    description: 'Search in company name, description, and user names',
    example: 'tech'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Recruiters retrieved successfully',
    type: SuccessResponseDto,
    schema: {
      example: {
        success: true,
        message: 'Recruiters retrieved successfully',
        data: {
          recruiters: [
            {
              id: 1,
              userId: 1,
              companyName: 'Tech Corp Inc.',
              type: 'COMPANY',
              description: 'Leading technology company',
              location: 'San Francisco, CA',
              website: 'https://techcorp.com',
              verified: true,
              createdAt: '2024-01-20T10:00:00.000Z',
              updatedAt: '2024-01-20T10:00:00.000Z',
              user: {
                id: 1,
                email: 'john@example.com',
                firstName: 'John',
                lastName: 'Doe'
              }
            }
          ],
          pagination: {
            currentPage: 1,
            totalPages: 5,
            totalItems: 47,
            itemsPerPage: 10,
            hasNextPage: true,
            hasPreviousPage: false
          }
        }
      }
    }
  })
  @ApiInternalServerErrorResponse({ 
    description: 'Internal server error',
    type: ErrorResponseDto
  })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('type') type?: RecruiterType,
    @Query('location') location?: string,
    @Query('verified') verified?: boolean,
    @Query('search') search?: string,
  ) {
    const pageNum = page && page > 0 ? page : 1;
    const limitNum = limit && limit > 0 && limit <= 100 ? limit : 10;
    
    const filters = {
      ...(type && { type }),
      ...(location && { location }),
      ...(verified !== undefined && { verified }),
      ...(search && { search }),
    };

    return this.recruiterService.findAll(pageNum, limitNum, filters);
  }

  @Get('stats')
  @ApiOperation({ 
    summary: 'Get recruiter statistics',
    description: 'Retrieves statistics about recruiters including total count, verification status, and breakdown by type.'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Recruiter statistics retrieved successfully',
    type: SuccessResponseDto,
    schema: {
      example: {
        success: true,
        message: 'Recruiter statistics retrieved successfully',
        data: {
          total: 150,
          verified: 89,
          unverified: 61,
          byType: {
            COMPANY: 95,
            INDIVIDUAL: 45,
            GROUP: 10
          }
        }
      }
    }
  })
  @ApiInternalServerErrorResponse({ 
    description: 'Internal server error',
    type: ErrorResponseDto
  })
  getStats() {
    return this.recruiterService.getRecruiterStats();
  }

  @Get('user/:userId')
  @ApiOperation({ 
    summary: 'Get recruiter by user ID',
    description: 'Retrieves a recruiter profile by the associated user ID.'
  })
  @ApiParam({ 
    name: 'userId', 
    type: Number, 
    description: 'User ID to find recruiter for',
    example: 1
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Recruiter retrieved successfully',
    type: SuccessResponseDto
  })
  @ApiNotFoundResponse({ 
    description: 'Recruiter profile not found for this user',
    type: ErrorResponseDto
  })
  @ApiInternalServerErrorResponse({ 
    description: 'Internal server error',
    type: ErrorResponseDto
  })
  findByUserId(@Param('userId', ParseIntPipe) userId: number) {
    return this.recruiterService.findByUserId(userId);
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get recruiter by ID',
    description: 'Retrieves a specific recruiter by their ID.'
  })
  @ApiParam({ 
    name: 'id', 
    type: Number, 
    description: 'Recruiter ID',
    example: 1
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Recruiter retrieved successfully',
    type: SuccessResponseDto
  })
  @ApiNotFoundResponse({ 
    description: 'Recruiter not found',
    type: ErrorResponseDto
  })
  @ApiInternalServerErrorResponse({ 
    description: 'Internal server error',
    type: ErrorResponseDto
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.recruiterService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ 
    summary: 'Update recruiter',
    description: 'Updates a recruiter profile. All fields are optional.'
  })
  @ApiParam({ 
    name: 'id', 
    type: Number, 
    description: 'Recruiter ID to update',
    example: 1
  })
  @ApiBody({ 
    type: UpdateRecruiterDto,
    description: 'Recruiter data to update',
    examples: {
      partial: {
        summary: 'Partial Update',
        value: {
          companyName: 'Updated Tech Corp Inc.',
          description: 'Updated description',
          verified: true
        }
      }
    }
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Recruiter updated successfully',
    type: SuccessResponseDto
  })
  @ApiBadRequestResponse({ 
    description: 'Invalid input data',
    type: ErrorResponseDto
  })
  @ApiNotFoundResponse({ 
    description: 'Recruiter not found',
    type: ErrorResponseDto
  })
  @ApiConflictResponse({ 
    description: 'Conflict with existing data',
    type: ErrorResponseDto
  })
  @ApiInternalServerErrorResponse({ 
    description: 'Internal server error',
    type: ErrorResponseDto
  })
  update(
    @Param('id', ParseIntPipe) id: number, 
    @Body(ValidationPipe) updateRecruiterDto: UpdateRecruiterDto
  ) {
    return this.recruiterService.update(id, updateRecruiterDto);
  }

  @Patch(':id/verify')
  @ApiOperation({ 
    summary: 'Verify recruiter',
    description: 'Marks a recruiter as verified. Usually done by administrators.'
  })
  @ApiParam({ 
    name: 'id', 
    type: Number, 
    description: 'Recruiter ID to verify',
    example: 1
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Recruiter verified successfully',
    type: SuccessResponseDto
  })
  @ApiNotFoundResponse({ 
    description: 'Recruiter not found',
    type: ErrorResponseDto
  })
  @ApiInternalServerErrorResponse({ 
    description: 'Internal server error',
    type: ErrorResponseDto
  })
  verify(@Param('id', ParseIntPipe) id: number) {
    return this.recruiterService.verifyRecruiter(id);
  }

  @Patch(':id/unverify')
  @ApiOperation({ 
    summary: 'Unverify recruiter',
    description: 'Marks a recruiter as unverified. Usually done by administrators.'
  })
  @ApiParam({ 
    name: 'id', 
    type: Number, 
    description: 'Recruiter ID to unverify',
    example: 1
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Recruiter unverified successfully',
    type: SuccessResponseDto
  })
  @ApiNotFoundResponse({ 
    description: 'Recruiter not found',
    type: ErrorResponseDto
  })
  @ApiInternalServerErrorResponse({ 
    description: 'Internal server error',
    type: ErrorResponseDto
  })
  unverify(@Param('id', ParseIntPipe) id: number) {
    return this.recruiterService.unverifyRecruiter(id);
  }

  @Delete(':id')
  @ApiOperation({ 
    summary: 'Delete recruiter',
    description: 'Permanently deletes a recruiter profile.'
  })
  @ApiParam({ 
    name: 'id', 
    type: Number, 
    description: 'Recruiter ID to delete',
    example: 1
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Recruiter deleted successfully',
    type: SuccessResponseDto,
    schema: {
      example: {
        success: true,
        message: 'Recruiter deleted successfully'
      }
    }
  })
  @ApiNotFoundResponse({ 
    description: 'Recruiter not found',
    type: ErrorResponseDto
  })
  @ApiInternalServerErrorResponse({ 
    description: 'Internal server error',
    type: ErrorResponseDto
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.recruiterService.remove(id);
  }
}