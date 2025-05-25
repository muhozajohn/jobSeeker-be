import { Injectable } from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { Prisma, SalaryType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ErrorHandlerService } from '../utils/error.utils';
import { createSuccessResponse } from '../utils/response.utils';

@Injectable()
export class JobService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly errorHandler: ErrorHandlerService,
  ) {}

  async create(createJobDto: CreateJobDto) {
    try {
      const job = await this.prisma.job.create({
        data: {
          ...createJobDto,
          salaryType: createJobDto.salaryType || SalaryType.MONTHLY,
          isActive: createJobDto.isActive ?? true,
          allowMultiple: createJobDto.allowMultiple ?? true,
        },
        include: {
          category: true,
          recruiter: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });
      return createSuccessResponse('Job created successfully', job);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          return this.errorHandler.handleError(
            { code: 404, message: 'Category or recruiter not found' },
            'JobService',
            'create',
          );
        }
      }
      return this.errorHandler.handleError(
        error,
        'JobService',
        'create',
        'Failed to create job',
      );
    }
  }

  async findAll(activeOnly: boolean = true) {
    try {
      const where = activeOnly ? { isActive: true } : {};
      const jobs = await this.prisma.job.findMany({
        where,
        include: {
          category: true,
          recruiter: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      return createSuccessResponse('Jobs retrieved successfully', jobs);
    } catch (error) {
      return this.errorHandler.handleError(
        error,
        'JobService',
        'findAll',
        'Failed to retrieve jobs',
      );
    }
  }

  async findOne(id: number) {
    try {
      const job = await this.prisma.job.findUnique({
        where: { id },
        include: {
          category: true,
          recruiter: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          applications: true,
          workAssignments: true,
        },
      });

      if (!job) {
        return this.errorHandler.handleError(
          { code: 404, message: 'Job not found' },
          'JobService',
          'findOne',
        );
      }

      return createSuccessResponse('Job retrieved successfully', job);
    } catch (error) {
      return this.errorHandler.handleError(
        error,
        'JobService',
        'findOne',
        'Failed to retrieve job',
      );
    }
  }

  async update(id: number, updateJobDto: UpdateJobDto) {
    try {
      const existingJob = await this.prisma.job.findUnique({
        where: { id },
      });

      if (!existingJob) {
        return this.errorHandler.handleError(
          { code: 404, message: 'Job not found' },
          'JobService',
          'update',
        );
      }

      const updatedJob = await this.prisma.job.update({
        where: { id },
        data: updateJobDto,
        include: {
          category: true,
          recruiter: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      return createSuccessResponse('Job updated successfully', updatedJob);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          return this.errorHandler.handleError(
            { code: 404, message: 'Category or recruiter not found' },
            'JobService',
            'update',
          );
        }
      }
      return this.errorHandler.handleError(
        error,
        'JobService',
        'update',
        'Failed to update job',
      );
    }
  }

  async remove(id: number) {
    try {
      const existingJob = await this.prisma.job.findUnique({
        where: { id },
      });

      if (!existingJob) {
        return this.errorHandler.handleError(
          { code: 404, message: 'Job not found' },
          'JobService',
          'remove',
        );
      }

      // Check if job has applications or assignments
      const hasDependencies = await this.prisma.job.findFirst({
        where: {
          id,
          OR: [
            { applications: { some: {} } },
            { workAssignments: { some: {} } },
          ],
        },
      });

      if (hasDependencies) {
        return this.errorHandler.handleError(
          { code: 400, message: 'Cannot delete job with existing applications or assignments' },
          'JobService',
          'remove',
        );
      }

      await this.prisma.job.delete({
        where: { id },
      });

      return createSuccessResponse('Job deleted successfully', null);
    } catch (error) {
      return this.errorHandler.handleError(
        error,
        'JobService',
        'remove',
        'Failed to delete job',
      );
    }
  }

  async toggleActiveStatus(id: number) {
    try {
      const job = await this.prisma.job.findUnique({
        where: { id },
      });

      if (!job) {
        return this.errorHandler.handleError(
          { code: 404, message: 'Job not found' },
          'JobService',
          'toggleActiveStatus',
        );
      }

      const updatedJob = await this.prisma.job.update({
        where: { id },
        data: { isActive: !job.isActive },
      });

      return createSuccessResponse(
        `Job ${updatedJob.isActive ? 'activated' : 'deactivated'} successfully`,
        updatedJob,
      );
    } catch (error) {
      return this.errorHandler.handleError(
        error,
        'JobService',
        'toggleActiveStatus',
        'Failed to toggle job status',
      );
    }
  }
}