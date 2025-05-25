import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateJobCategoryDto {

    @ApiProperty({
        example: 'Teacher',
        description: 'Job category name',
        required: true,
    })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({
        example: 'Responsible for teaching students at a school',
        description: 'Detailed description of the job category',
        required: false, 
    })
    @IsString()
    @IsOptional()
    description?: string;
}
