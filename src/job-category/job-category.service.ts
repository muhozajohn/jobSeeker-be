import { Injectable } from '@nestjs/common';
import { CreateJobCategoryDto } from './dto/create-job-category.dto';
import { UpdateJobCategoryDto } from './dto/update-job-category.dto';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ErrorHandlerService } from '../utils/error.utils';
import { badRequestError, createSuccessResponse, notFoundError } from '../utils/response.utils';

@Injectable()
export class JobCategoryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly errorHandler: ErrorHandlerService,
  ) { }

  async create(createJobCategoryDto: CreateJobCategoryDto) {
    try {

      //  check if name Exist
      const findName = await this.prisma.jobCategory.findFirst({
        where: {
          name: createJobCategoryDto.name
        }
      });
      if (!findName) {
        return notFoundError('Job category with this name already exists')
      }

      const jobCategory = await this.prisma.jobCategory.create({
        data: createJobCategoryDto,
      });
      return createSuccessResponse('Job category created successfully', jobCategory);
    } catch (error) {
      return this.errorHandler.handleError(
        error,
        'JobCategoryService',
        'create',
        'Failed to create job category',
      );
    }
  }

  async findAll() {
    try {
      const jobCategories = await this.prisma.jobCategory.findMany();
      return createSuccessResponse('Job categories retrieved successfully', jobCategories);
    } catch (error) {
      return this.errorHandler.handleError(
        error,
        'JobCategoryService',
        'findAll',
        'Failed to retrieve job categories',
      );
    }
  }

  async findOne(id: number) {
    try {
      const jobCategory = await this.prisma.jobCategory.findUnique({
        where: { id },
      });

      if (!jobCategory) {
        return notFoundError('Job category not found')
      }

      return createSuccessResponse('Job category retrieved successfully', jobCategory);
    } catch (error) {
      return this.errorHandler.handleError(
        error,
        'JobCategoryService',
        'findOne',
        'Failed to retrieve job category',
      );
    }
  }

  async update(id: number, updateJobCategoryDto: UpdateJobCategoryDto) {
    try {
      const existingCategory = await this.prisma.jobCategory.findUnique({
        where: { id },
      });

      if (!existingCategory) {
        return notFoundError('Job category not found')
      }

         //  check if name Exist
      const findName = await this.prisma.jobCategory.findFirst({
        where: {
          name: updateJobCategoryDto.name
        }
      });
      if (!findName) {
        return notFoundError('Job category with this name already exists')
      }

      const updatedCategory = await this.prisma.jobCategory.update({
        where: { id },
        data: updateJobCategoryDto,
      });

      return createSuccessResponse('Job category updated successfully', updatedCategory);
    } catch (error) {
      return this.errorHandler.handleError(
        error,
        'JobCategoryService',
        'update',
        'Failed to update job category',
      );
    }
  }

  async remove(id: number) {
    try {
      const existingCategory = await this.prisma.jobCategory.findUnique({
        where: { id },
      });

      if (!existingCategory) {
          return notFoundError('Job category not found')
      }

      await this.prisma.jobCategory.delete({
        where: { id },
      });

      return createSuccessResponse('Job category deleted successfully', null);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          return badRequestError('Cannot delete job category as it is referenced by other records');
        }
      }
      return this.errorHandler.handleError(
        error,
        'JobCategoryService',
        'remove',
        'Failed to delete job category',
      );
    }
  }
}