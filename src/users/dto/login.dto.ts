import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsNotEmpty } from 'class-validator';

export class LoginDto {
    id: number
    @ApiProperty({ example: 'user@example.com', description: 'Email address' })
    @IsEmail({}, { message: 'Invalid email format' })
    @IsNotEmpty({ message: 'Email is required' })
    email: string;

    @ApiProperty({ example: 'password123', description: 'Password' })
    @IsString()
    @IsNotEmpty({ message: 'Password is required' })
    password: string;
}