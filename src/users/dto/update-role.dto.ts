// update-role.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { Role } from '@prisma/client';

export class UpdateRoleDto {
  @ApiProperty({ 
    enum: Role, 
    example: Role.ADMIN, 
    description: 'User role' 
  })
  @IsEnum(Role, { message: 'Invalid role' })
  @IsNotEmpty({ message: 'Role is required' })
  role: Role;
}