import { Injectable } from '@nestjs/common';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { Prisma, ApplicationStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ErrorHandlerService } from '../utils/error.utils';
import { createSuccessResponse } from '../utils/response.utils';

@Injectable()
export class ApplicationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly errorHandler: ErrorHandlerService,
  ) {}

  async create(createApplicationDto: CreateApplicationDto) {
    try {
      // Check if application already exists
      const existingApplication = await this.prisma.application.findUnique({
        where: {
          jobId_workerId: {
            jobId: createApplicationDto.jobId,
            workerId: createApplicationDto.workerId,
          },
        },
      });

      if (existingApplication) {
        return this.errorHandler.handleError(
          { code: 409, message: 'Application already exists for this job and worker' },
          'ApplicationService',
          'create',
        );
      }

      const application = await this.prisma.application.create({
        data: {
          ...createApplicationDto,
          status: createApplicationDto.status || ApplicationStatus.PENDING,
        },
        include: {
          job: {
            include: {
              category: true,
              recruiter: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
          worker: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      return createSuccessResponse('Application created successfully', application);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          return this.errorHandler.handleError(
            { code: 404, message: 'Job or worker not found' },
            'ApplicationService',
            'create',
          );
        }
      }
      return this.errorHandler.handleError(
        error,
        'ApplicationService',
        'create',
        'Failed to create application',
      );
    }
  }

  async findAll() {
    try {
      const applications = await this.prisma.application.findMany({
        include: {
          job: {
            include: {
              category: true,
            },
          },
          worker: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: {
          appliedAt: 'desc',
        },
      });
      return createSuccessResponse('Applications retrieved successfully', applications);
    } catch (error) {
      return this.errorHandler.handleError(
        error,
        'ApplicationService',
        'findAll',
        'Failed to retrieve applications',
      );
    }
  }

  async findOne(id: number) {
    try {
      const application = await this.prisma.application.findUnique({
        where: { id },
        include: {
          job: {
            include: {
              category: true,
              recruiter: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
          worker: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      if (!application) {
        return this.errorHandler.handleError(
          { code: 404, message: 'Application not found' },
          'ApplicationService',
          'findOne',
        );
      }

      return createSuccessResponse('Application retrieved successfully', application);
    } catch (error) {
      return this.errorHandler.handleError(
        error,
        'ApplicationService',
        'findOne',
        'Failed to retrieve application',
      );
    }
  }

  async update(id: number, updateApplicationDto: UpdateApplicationDto) {
    try {
      const existingApplication = await this.prisma.application.findUnique({
        where: { id },
      });

      if (!existingApplication) {
        return this.errorHandler.handleError(
          { code: 404, message: 'Application not found' },
          'ApplicationService',
          'update',
        );
      }

      const updatedApplication = await this.prisma.application.update({
        where: { id },
        data: updateApplicationDto,
        include: {
          job: {
            include: {
              category: true,
            },
          },
          worker: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      return createSuccessResponse('Application updated successfully', updatedApplication);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          return this.errorHandler.handleError(
            { code: 404, message: 'Job or worker not found' },
            'ApplicationService',
            'update',
          );
        }
        if (error.code === 'P2002') {
          return this.errorHandler.handleError(
            { code: 409, message: 'Application already exists for this job and worker' },
            'ApplicationService',
            'update',
          );
        }
      }
      return this.errorHandler.handleError(
        error,
        'ApplicationService',
        'update',
        'Failed to update application',
      );
    }
  }

  async remove(id: number) {
    try {
      const existingApplication = await this.prisma.application.findUnique({
        where: { id },
      });

      if (!existingApplication) {
        return this.errorHandler.handleError(
          { code: 404, message: 'Application not found' },
          'ApplicationService',
          'remove',
        );
      }

      await this.prisma.application.delete({
        where: { id },
      });

      return createSuccessResponse('Application deleted successfully', null);
    } catch (error) {
      return this.errorHandler.handleError(
        error,
        'ApplicationService',
        'remove',
        'Failed to delete application',
      );
    }
  }

  async findByJob(jobId: number) {
    try {
      const applications = await this.prisma.application.findMany({
        where: { jobId },
        include: {
          worker: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: {
          appliedAt: 'desc',
        },
      });
      return createSuccessResponse('Applications retrieved successfully', applications);
    } catch (error) {
      return this.errorHandler.handleError(
        error,
        'ApplicationService',
        'findByJob',
        'Failed to retrieve applications for job',
      );
    }
  }

  async findByWorker(workerId: number) {
    try {
      const applications = await this.prisma.application.findMany({
        where: { workerId },
        include: {
          job: {
            include: {
              category: true,
              recruiter: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
        orderBy: {
          appliedAt: 'desc',
        },
      });
      return createSuccessResponse('Applications retrieved successfully', applications);
    } catch (error) {
      return this.errorHandler.handleError(
        error,
        'ApplicationService',
        'findByWorker',
        'Failed to retrieve applications for worker',
      );
    }
  }

  async updateStatus(id: number, status: ApplicationStatus) {
    try {
      const existingApplication = await this.prisma.application.findUnique({
        where: { id },
      });

      if (!existingApplication) {
        return this.errorHandler.handleError(
          { code: 404, message: 'Application not found' },
          'ApplicationService',
          'updateStatus',
        );
      }

      const updatedApplication = await this.prisma.application.update({
        where: { id },
        data: { status },
        include: {
          job: true,
          worker: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      return createSuccessResponse('Application status updated successfully', updatedApplication);
    } catch (error) {
      return this.errorHandler.handleError(
        error,
        'ApplicationService',
        'updateStatus',
        'Failed to update application status',
      );
    }
  }
}