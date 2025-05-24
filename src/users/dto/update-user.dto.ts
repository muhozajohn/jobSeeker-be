
import { Express } from 'express';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { 
  IsEmail, 
  IsString, 
  IsOptional, 
  IsEnum, 
  IsNotEmpty, 
  IsBoolean,
  Length,
  Matches
} from 'class-validator';
import { Role } from '@prisma/client';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiPropertyOptional({ 
    example: 'user@example.com', 
    description: 'User email address' 
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ 
    example: 'NewSecurePass123!', 
    description: 'User password (min 6 characters)' 
  })
  @IsString()
  @Length(6, 50, { message: 'Password must be between 6 and 50 characters' })
  @IsOptional()
  password?: string;

  @ApiPropertyOptional({ 
    example: 'John', 
    description: 'User first name' 
  })
  @IsString()
  @Length(1, 50, { message: 'First name must be between 1 and 50 characters' })
  @IsOptional()
  firstName?: string;

  @ApiPropertyOptional({ 
    example: 'Doe', 
    description: 'User last name' 
  })
  @IsString()
  @Length(1, 50, { message: 'Last name must be between 1 and 50 characters' })
  @IsOptional()
  lastName?: string;

  @ApiPropertyOptional({ 
    example: '+1234567890', 
    description: 'User phone number' 
  })
  @IsString()
  @IsOptional()
  @Matches(/^[\+]?[1-9][\d]{0,15}$/, { 
    message: 'Please provide a valid phone number' 
  })
  phone?: string;

  @ApiPropertyOptional({ 
    example: 'https://example.com/avatar.jpg', 
    description: 'User avatar URL' 
  })
  @IsString()
  @IsOptional()
  avatar?: string;

  @ApiPropertyOptional({ 
    enum: Role, 
    example: Role.RECRUITER, 
    description: 'User role in the system' 
  })
  @IsEnum(Role, { message: 'Role must be one of: ADMIN, RECRUITER, WORKER' })
  @IsOptional()
  role?: Role;

  @ApiPropertyOptional({ 
    example: true, 
    description: 'Whether the user account is active' 
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateRoleDto {
  @ApiProperty({ 
    enum: Role, 
    example: Role.RECRUITER, 
    description: 'New role for the user' 
  })
  @IsEnum(Role, { message: 'Role must be one of: ADMIN, RECRUITER, WORKER' })
  @IsNotEmpty({ message: 'Role is required' })
  role: Role;
}

export class UserSearchDto {
  @ApiPropertyOptional({ 
    example: 'john', 
    description: 'Search query for user name or email' 
  })
  @IsString()
  @IsOptional()
  @Length(1, 100, { message: 'Search query must be between 1 and 100 characters' })
  query?: string;

  @ApiPropertyOptional({ 
    enum: Role, 
    description: 'Filter by user role' 
  })
  @IsEnum(Role, { message: 'Role must be one of: ADMIN, RECRUITER, WORKER' })
  @IsOptional()
  role?: Role;

  @ApiPropertyOptional({ 
    example: true, 
    description: 'Filter by active status' 
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ 
    example: 0, 
    description: 'Number of records to skip for pagination',
    minimum: 0 
  })
  @IsOptional()
  skip?: number;

  @ApiPropertyOptional({ 
    example: 10, 
    description: 'Maximum number of records to return',
    minimum: 1,
    maximum: 100 
  })
  @IsOptional()
  take?: number;
}

export class UserResponseDto {
  @ApiProperty({ example: 1, description: 'User ID' })
  id: number;

  @ApiProperty({ example: 'user@example.com', description: 'User email' })
  email: string;

  @ApiProperty({ example: 'John', description: 'User first name' })
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'User last name' })
  lastName: string;

  @ApiPropertyOptional({ example: '+1234567890', description: 'User phone number' })
  phone?: string;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.jpg', description: 'User avatar URL' })
  avatar?: string;

  @ApiProperty({ enum: Role, example: Role.WORKER, description: 'User role' })
  role: Role;

  @ApiProperty({ example: true, description: 'Whether the user is active' })
  isActive: boolean;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z', description: 'User creation timestamp' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z', description: 'User last update timestamp' })
  updatedAt: Date;
}

export class PaginatedUsersResponseDto {
  @ApiProperty({ example: 100, description: 'Total number of users' })
  totalCount: number;

  @ApiProperty({ example: 1, description: 'Current page number' })
  page: number;

  @ApiProperty({ example: 10, description: 'Number of users per page' })
  pageSize: number;

  @ApiProperty({ 
    type: [UserResponseDto], 
    description: 'Array of users' 
  })
  users: UserResponseDto[];
}

// Role-specific query DTOs
export class GetRecruitersDto {
  @ApiPropertyOptional({ 
    example: false, 
    description: 'Include job information in response' 
  })
  @IsBoolean()
  @IsOptional()
  includeJobs?: boolean;

  @ApiPropertyOptional({ 
    example: 0, 
    description: 'Number of records to skip for pagination' 
  })
  @IsOptional()
  skip?: number;

  @ApiPropertyOptional({ 
    example: 10, 
    description: 'Maximum number of records to return' 
  })
  @IsOptional()
  take?: number;
}

export class GetWorkersDto {
  @ApiPropertyOptional({ 
    example: false, 
    description: 'Include application information in response' 
  })
  @IsBoolean()
  @IsOptional()
  includeApplications?: boolean;

  @ApiPropertyOptional({ 
    example: 0, 
    description: 'Number of records to skip for pagination' 
  })
  @IsOptional()
  skip?: number;

  @ApiPropertyOptional({ 
    example: 10, 
    description: 'Maximum number of records to return' 
  })
  @IsOptional()
  take?: number;
}


//  update avatar
export class updateAvatarDto {
  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Avatar image file',
  })
  @IsOptional()
  avatar?: Express.Multer.File;
};