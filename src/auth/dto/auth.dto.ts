import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsNotEmpty,
  Length,
} from 'class-validator';


export class LoginDto {

  @ApiProperty({ example: 'worker@example.com', description: 'User email' })
  @IsEmail({}, { message: 'Please provide a valid email' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({ example: 'password123', description: 'User password' })
  @IsString()
  @Length(6, 30, { message: 'Password must be between 6 and 30 characters' })
  @IsNotEmpty({ message: 'Password is required' })
  password: string;
}

