import { Injectable } from '@nestjs/common';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { Prisma, ApplicationStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ErrorHandlerService } from '../utils/error.utils';
import { conflictError, createSuccessResponse, notFoundError, } from '../utils/response.utils';
import { SendEmailService } from 'src/send-email/send-email.service';

@Injectable()
export class ApplicationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly errorHandler: ErrorHandlerService,
    private readonly emailService: SendEmailService,
  ) { }

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
        return conflictError("Application already exists for this job and worker")
      }

      // Job or worker not found

      //  check if jobId Exist
      const findJobId = await this.prisma.job.findFirst({
        where: {
          id: createApplicationDto.jobId
        }
      });
      if (!findJobId) {
        return notFoundError("Job not found")
      }
      //  check if workerId Exist
      const findworkerId = await this.prisma.worker.findFirst({
        where: {
          id: createApplicationDto.workerId
        }
      });
      if (!findworkerId) {
        return notFoundError("worker not found")
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
                  email: true,
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

      // Send email notification to recruiter
      await this.emailService.sendJobApplicationNotification(
        application.job.recruiter.email,
        `${application.job.recruiter.firstName} ${application.job.recruiter.lastName}`,
        application.job.title,
        `${application.worker.firstName} ${application.worker.lastName}`,
        createApplicationDto.message || ''
      ).catch(err => {
        console.error('Failed to send application notification email:', err);
      });

      return createSuccessResponse('Application created successfully', application);
    } catch (error) {
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
        return notFoundError('Application not found')
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
        return notFoundError('Application not found')
      }

      // Job or worker not found

      //  check if jobId Exist
      const findJobId = await this.prisma.job.findFirst({
        where: {
          id: updateApplicationDto.jobId
        }
      });
      if (!findJobId) {
        return notFoundError("Job not found")
      }
      //  check if workerId Exist
      const findworkerId = await this.prisma.worker.findFirst({
        where: {
          id: updateApplicationDto.workerId
        }
      });
      if (!findworkerId) {
        return notFoundError("worker not found")
      }

      const updatedApplication = await this.prisma.application.update({
        where: { id },
        data: updateApplicationDto,
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
              email:true
            },
          },
        },
      });


           // Send email notification based on status change
      if (status === ApplicationStatus.ACCEPTED) {
        await this.emailService.sendWorkAssignmentNotification(
          updatedApplication.worker.email,
          `${updatedApplication.worker.firstName} ${updatedApplication.worker.lastName}`,
          updatedApplication.job.title,
          undefined, // startTime
          undefined, // endTime
          undefined, // workDate
          `${updatedApplication.job.recruiter.firstName} ${updatedApplication.job.recruiter.lastName}`
        ).catch(err => {
          console.error('Failed to send work assignment email:', err);
        });
      }

      return createSuccessResponse('Application updated successfully', updatedApplication);
    } catch (error) {

      if (error.code === 'P2002') {
        return conflictError('Application already exists for this job and worker');
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
        return conflictError('Application not found')
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