import { Injectable } from '@nestjs/common';
import { CreateWorkAssignmentDto } from './dto/create-work-assignment.dto';
import { UpdateWorkAssignmentDto } from './dto/update-work-assignment.dto';
import { AssignmentStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ErrorHandlerService } from '../utils/error.utils';
import { conflictError, createSuccessResponse, notFoundError } from '../utils/response.utils';

@Injectable()
export class WorkAssignmentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly errorHandler: ErrorHandlerService,
  ) { }

  async create(createWorkAssignmentDto: CreateWorkAssignmentDto) {
    try {
      // Check if worker is already assigned to this job on the same date
      const existingAssignment = await this.prisma.workAssignment.findFirst({
        where: {
          jobId: createWorkAssignmentDto.jobId,
          workerId: createWorkAssignmentDto.workerId,
          workDate: createWorkAssignmentDto.workDate,
        },
      });

      if (existingAssignment) {
        return conflictError("Worker already assigned to this job on the specified date")
      }

      //  check if jobId Exist
      const findJobId = await this.prisma.job.findFirst({
        where: {
          id: createWorkAssignmentDto.jobId
        }
      });
      if (!findJobId) {
        return notFoundError("Job not found")
      }
      //  check if workerId Exist
      const findworkerId = await this.prisma.worker.findFirst({
        where: {
          id: createWorkAssignmentDto.workerId
        }
      });
      if (!findworkerId) {
        return notFoundError("worker not found")
      }
      //  check if workerId Exist
      const findrecruiterId = await this.prisma.recruiter.findFirst({
        where: {
          id: createWorkAssignmentDto.recruiterId
        }
      });
      if (!findrecruiterId) {
        return notFoundError("Recruiter not found")
      }


      const assignment = await this.prisma.workAssignment.create({
        data: {
          ...createWorkAssignmentDto,
          status: createWorkAssignmentDto.status || AssignmentStatus.ACTIVE,
        },
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
          recruiter: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      return createSuccessResponse('Work assignment created successfully', assignment);
    } catch (error) {
      return this.errorHandler.handleError(
        error,
        'WorkAssignmentService',
        'create',
        'Failed to create work assignment',
      );
    }
  }

  async findAll() {
    try {
      const assignments = await this.prisma.workAssignment.findMany({
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
          recruiter: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: {
          workDate: 'desc',
        },
      });
      return createSuccessResponse('Work assignments retrieved successfully', assignments);
    } catch (error) {
      return this.errorHandler.handleError(
        error,
        'WorkAssignmentService',
        'findAll',
        'Failed to retrieve work assignments',
      );
    }
  }

  async findOne(id: number) {
    try {
      const assignment = await this.prisma.workAssignment.findUnique({
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
          recruiter: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      if (!assignment) {
        return notFoundError("Work assignment not found")
      }

      return createSuccessResponse('Work assignment retrieved successfully', assignment);
    } catch (error) {
      return this.errorHandler.handleError(
        error,
        'WorkAssignmentService',
        'findOne',
        'Failed to retrieve work assignment',
      );
    }
  }

  async update(id: number, updateWorkAssignmentDto: UpdateWorkAssignmentDto) {
    try {
      const existingAssignment = await this.prisma.workAssignment.findUnique({
        where: { id },
      });

      if (!existingAssignment) {
          return notFoundError("Work assignment not found")
      }

      const updatedAssignment = await this.prisma.workAssignment.update({
        where: { id },
        data: updateWorkAssignmentDto,
        include: {
          job: true,
          worker: true,
          recruiter: true,
        },
      });

      return createSuccessResponse('Work assignment updated successfully', updatedAssignment);
    } catch (error) {
      return this.errorHandler.handleError(
        error,
        'WorkAssignmentService',
        'update',
        'Failed to update work assignment',
      );
    }
  }

  async remove(id: number) {
    try {
      const existingAssignment = await this.prisma.workAssignment.findUnique({
        where: { id },
      });

      if (!existingAssignment) {
          return notFoundError("Work assignment not found")
      }

      await this.prisma.workAssignment.delete({
        where: { id },
      });

      return createSuccessResponse('Work assignment deleted successfully', null);
    } catch (error) {
      return this.errorHandler.handleError(
        error,
        'WorkAssignmentService',
        'remove',
        'Failed to delete work assignment',
      );
    }
  }

  async findByWorker(workerId: number) {
    try {
      const assignments = await this.prisma.workAssignment.findMany({
        where: { workerId },
        include: {
          job: {
            include: {
              category: true,
            },
          },
          recruiter: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: {
          workDate: 'desc',
        },
      });
      return createSuccessResponse('Worker assignments retrieved successfully', assignments);
    } catch (error) {
      return this.errorHandler.handleError(
        error,
        'WorkAssignmentService',
        'findByWorker',
        'Failed to retrieve worker assignments',
      );
    }
  }

  async findByJob(jobId: number) {
    try {
      const assignments = await this.prisma.workAssignment.findMany({
        where: { jobId },
        include: {
          worker: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          recruiter: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: {
          workDate: 'desc',
        },
      });
      return createSuccessResponse('Job assignments retrieved successfully', assignments);
    } catch (error) {
      return this.errorHandler.handleError(
        error,
        'WorkAssignmentService',
        'findByJob',
        'Failed to retrieve job assignments',
      );
    }
  }

  async findByRecruiter(recruiterId: number) {
    try {
      const assignments = await this.prisma.workAssignment.findMany({
        where: { recruiterId },
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
          workDate: 'desc',
        },
      });
      return createSuccessResponse('Recruiter assignments retrieved successfully', assignments);
    } catch (error) {
      return this.errorHandler.handleError(
        error,
        'WorkAssignmentService',
        'findByRecruiter',
        'Failed to retrieve recruiter assignments',
      );
    }
  }

  async updateStatus(id: number, status: AssignmentStatus) {
    try {
      const existingAssignment = await this.prisma.workAssignment.findUnique({
        where: { id },
      });

      if (!existingAssignment) {
        return notFoundError("Work assignment not found")

      }

      const updatedAssignment = await this.prisma.workAssignment.update({
        where: { id },
        data: { status },
        include: {
          job: true,
          worker: true,
        },
      });

      return createSuccessResponse('Work assignment status updated successfully', updatedAssignment);
    } catch (error) {
      return this.errorHandler.handleError(
        error,
        'WorkAssignmentService',
        'updateStatus',
        'Failed to update work assignment status',
      );
    }
  }
}