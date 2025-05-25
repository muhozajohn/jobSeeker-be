import { Injectable } from '@nestjs/common';
import { UpdateWorkerDto } from './dto/update-worker.dto';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ErrorHandlerService } from '../utils/error.utils';
import { createSuccessResponse, notFoundError, conflictError, badRequestError, forbiddenError, serverError } from '../utils/response.utils';
import { CreateWorkerDto } from './dto/create-worker.dto';

@Injectable()
export class WorkerService {

  constructor(
    private readonly prisma: PrismaService,
    private readonly errorHandler: ErrorHandlerService,
  ) { }

  async create(createWorkerDto: CreateWorkerDto, userId: number) {
    try {
      // Check if user exists in User table
      const existingUser = await this.prisma.user.findUnique({
        where: {
          id: userId
        }
      });

      if (!existingUser) {
        return notFoundError('User not found');
      }

    
      // Check if worker profile already exists for this user
      const existingWorker = await this.prisma.worker.findUnique({
        where: {
          userId: userId
        }
      });

      if (existingWorker) {
        return conflictError('Worker profile already exists for this user');
      }

      // Create worker profile
      const newWorker = await this.prisma.worker.create({
        data: {
          userId: userId ,
          location: createWorkerDto.location,
          experience: createWorkerDto.experience,
          skills: createWorkerDto.skills,
          resume: createWorkerDto.resume,
          available: createWorkerDto.available ?? true,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            }
          }
        }
      });

      return createSuccessResponse("Worker profile created successfully", newWorker);

    } catch (error) {
      return this.errorHandler.handleError(
        error,
        'WorkerService',
        'create',
        'Failed to create worker profile'
      );
    }
  }

  async findAll() {
    try {
      const workers = await this.prisma.worker.findMany({
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return createSuccessResponse("Workers retrieved successfully", workers);
    } catch (error) {
      return this.errorHandler.handleError(
        error,
        'WorkerService',
        'findAll',
        'Failed to retrieve workers'
      );
    }
  }

  async findOne(id: number) {
    try {
      const worker = await this.prisma.worker.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            }
          }
        }
      });

      if (!worker) {
        return notFoundError('Worker not found');
      }

      return createSuccessResponse("Worker retrieved successfully", worker);
    } catch (error) {
      return this.errorHandler.handleError(
        error,
        'WorkerService',
        'findOne',
        'Failed to retrieve worker'
      );
    }
  }

  async findByUserId(userId: number) {
    try {
      const worker = await this.prisma.worker.findUnique({
        where: { userId },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            }
          }
        }
      });

      if (!worker) {
        return notFoundError('Worker profile not found for this user');
      }

      return createSuccessResponse("Worker profile retrieved successfully", worker);
    } catch (error) {
      return this.errorHandler.handleError(
        error,
        'WorkerService',
        'findByUserId',
        'Failed to retrieve worker profile'
      );
    }
  }

  async update(id: number, updateWorkerDto: UpdateWorkerDto) {
    try {
      // Check if worker exists
      const existingWorker = await this.prisma.worker.findUnique({
        where: { id }
      });

      if (!existingWorker) {
        return notFoundError('Worker not found');
      }

      // Update worker
      const updatedWorker = await this.prisma.worker.update({
        where: { id },
        data: {
          ...updateWorkerDto,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            }
          }
        }
      });

      return createSuccessResponse("Worker updated successfully", updatedWorker);
    } catch (error) {
      return this.errorHandler.handleError(
        error,
        'WorkerService',
        'update',
        'Failed to update worker'
      );
    }
  }

  async remove(id: number) {
    try {
      // Check if worker exists
      const existingWorker = await this.prisma.worker.findUnique({
        where: { id }
      });

      if (!existingWorker) {
        return notFoundError('Worker not found');
      }

      // Delete worker
      await this.prisma.worker.delete({
        where: { id }
      });

      return createSuccessResponse("Worker deleted successfully");
    } catch (error) {
      return this.errorHandler.handleError(
        error,
        'WorkerService',
        'remove',
        'Failed to delete worker'
      );
    }
  }

  async toggleAvailability(id: number) {
    try {
      const worker = await this.prisma.worker.findUnique({
        where: { id }
      });

      if (!worker) {
        return notFoundError('Worker not found');
      }

      const updatedWorker = await this.prisma.worker.update({
        where: { id },
        data: {
          available: !worker.available
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            }
          }
        }
      });

      return createSuccessResponse(
        `Worker availability updated to ${updatedWorker.available ? 'available' : 'unavailable'}`,
        updatedWorker
      );
    } catch (error) {
      return this.errorHandler.handleError(
        error,
        'WorkerService',
        'toggleAvailability',
        'Failed to toggle worker availability'
      );
    }
  }
}