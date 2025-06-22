import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, Prisma, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { CloudinaryService } from '../utils/cloudinary.service';
import { ErrorHandlerService } from '../utils/error.utils';
import { ServiceResponse, badRequestError, createSuccessResponse, notFoundError } from '../utils/response.utils';

@Injectable()
export class UsersService {
  private readonly SALT_ROUNDS = 10;

  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly errorHandler: ErrorHandlerService,
  ) {}

  // PRIVATE HELPER METHODS

  private async checkEmailExists(email: string, excludeId?: number): Promise<void> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser && existingUser.id !== excludeId) {
      throw new ConflictException(`Email ${email} already exists`);
    }
  }

  private async findUserOrThrow(id: number): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        recruiter: true,
        worker: true,
        jobs: true,
        applications: true,
        workAssignments: true,
        recruiterAssignments: true,
      }
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  private validateUserRole(role: Role): void {
    if (!Object.values(Role).includes(role)) {
      throw new BadRequestException(`Invalid role: ${role}`);
    }
  }

  // PUBLIC API METHODS

async create(
  userData: Prisma.UserCreateInput,
  file?: Express.Multer.File
): Promise<ServiceResponse> {
  try {
    this.validateUserRole(userData.role);
    // await this.checkEmailExists(userData.email);

    const hashedPassword = await this.hashPassword(userData.password);

    let avatarUrl: string | undefined;
    if (file) {
      avatarUrl = await this.cloudinaryService.uploadImage(file);
    }

    const newUser = await this.prisma.user.create({
      data: {
        ...userData,
        isActive: Boolean(userData.isActive),
        password: hashedPassword,
        ...(avatarUrl && { avatar: avatarUrl }), 
      },
      include: {
        recruiter: true,
        worker: true,
      }
    });

    // Remove password from response
    const { password, ...userResponse } = newUser;

    return createSuccessResponse('User created successfully', userResponse);
  } catch (error) {
    return this.errorHandler.handleError(
      error,
      'UsersService',
      'create user',
      'Failed to create user'
    );
  }
}

  async findAll(
    skip?: number,
    take?: number,
    orderBy?: Prisma.UserOrderByWithRelationInput,
    where?: Prisma.UserWhereInput,
    includeRelations: boolean = false,
  ): Promise<ServiceResponse> {
    try {
      const users = await this.prisma.user.findMany({
        skip,
        take,
        where,
        orderBy: orderBy || { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          avatar: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          recruiter: includeRelations,
          worker: includeRelations,
          jobs: includeRelations,
          applications: includeRelations,
          workAssignments: includeRelations,
          recruiterAssignments: includeRelations,
        }
      });

      const totalCount = await this.prisma.user.count({ where });

      return createSuccessResponse('Users retrieved successfully', {
        totalCount,
        page: skip ? Math.floor(skip / (take || 10)) + 1 : 1,
        pageSize: take || users.length,
        users,
      });
    } catch (error) {
      return this.errorHandler.handleError(
        error,
        'UsersService',
        'find all users',
        'Failed to retrieve users'
      );
    }
  }

  async findOne(
    id: number,
    includeRelations: boolean = true,
  ): Promise<ServiceResponse> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          avatar: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          recruiter: includeRelations,
          worker: includeRelations,
          jobs: includeRelations ? {
            include: {
              applications: true,
              workAssignments: true,
            }
          } : false,
          applications: includeRelations ? {
            include: {
              job: true,
            }
          } : false,
          workAssignments: includeRelations ? {
            include: {
              job: true,
              recruiter: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                }
              }
            }
          } : false,
          recruiterAssignments: includeRelations ? {
            include: {
              job: true,
              worker: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                }
              }
            }
          } : false,
        }
      });

      if (!user) {
        return notFoundError(`User with ID ${id} not found`);
      }

      return createSuccessResponse('User retrieved successfully', user);
    } catch (error) {
      return this.errorHandler.handleError(
        error,
        'UsersService',
        'find user',
        'Failed to retrieve user'
      );
    }
  }

  async update(
    id: number,
    updateData: Prisma.UserUpdateInput,
    file?: Express.Multer.File,
  ): Promise<ServiceResponse> {
    try {
      await this.findUserOrThrow(id);

      // Check email uniqueness if email is being updated
      if (updateData.email && typeof updateData.email === 'string') {
        await this.checkEmailExists(updateData.email, id);
      }

      // Validate role if being updated
      if (updateData.role && typeof updateData.role === 'string') {
        this.validateUserRole(updateData.role as Role);
      }

      let avatarUrl: string | undefined;
      if (file) {
        avatarUrl = await this.cloudinaryService.uploadImage(file);
      }

      const userUpdateData: Prisma.UserUpdateInput = { ...updateData };

      if (updateData.password && typeof updateData.password === 'string') {
        userUpdateData.password = await this.hashPassword(updateData.password);
      }

      if (avatarUrl) {
        userUpdateData.avatar = avatarUrl;
      }

      const updatedUser = await this.prisma.user.update({
        where: { id },
        data: userUpdateData,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          avatar: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          recruiter: true,
          worker: true,
        }
      });

      return createSuccessResponse('User updated successfully', updatedUser);
    } catch (error) {
      return this.errorHandler.handleError(
        error,
        'UsersService',
        'update user',
        'Failed to update user'
      );
    }
  }

  async updateAvatar(
    id: number,
    file: Express.Multer.File
  ): Promise<ServiceResponse> {
    try {
      await this.findUserOrThrow(id);

      const avatarUrl = await this.cloudinaryService.uploadImage(file);

      const updatedUser = await this.prisma.user.update({
        where: { id },
        data: { avatar: avatarUrl },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          avatar: true,
        }
      });

      return createSuccessResponse('Avatar updated successfully', updatedUser);
    } catch (error) {
      return this.errorHandler.handleError(
        error,
        'UsersService',
        'update avatar',
        'Failed to update avatar'
      );
    }
  }

  async remove(id: number): Promise<ServiceResponse> {
    try {
      await this.findUserOrThrow(id);

      await this.prisma.user.delete({
        where: { id },
      });

      return createSuccessResponse('User deleted successfully');
    } catch (error) {
      return this.errorHandler.handleError(
        error,
        'UsersService',
        'delete user',
        'Failed to delete user'
      );
    }
  }

  async toggleUserStatus(userId: number): Promise<ServiceResponse> {
    try {
      const existingUser = await this.findUserOrThrow(userId);

      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: { isActive: !existingUser.isActive },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          isActive: true,
        }
      });

      return createSuccessResponse(
        `User ${updatedUser.isActive ? 'activated' : 'deactivated'} successfully`,
        updatedUser
      );
    } catch (error) {
      return this.errorHandler.handleError(
        error,
        'UsersService',
        'toggle user status',
        'Failed to toggle user status'
      );
    }
  }

  async updateRole(userId: number, newRole: Role): Promise<ServiceResponse> {
    try {
      this.validateUserRole(newRole);
      await this.findUserOrThrow(userId);

      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: { role: newRole },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
        }
      });

      return createSuccessResponse(`User role updated to ${newRole}`, updatedUser);
    } catch (error) {
      return this.errorHandler.handleError(
        error,
        'UsersService',
        'update role',
        'Failed to update user role'
      );
    }
  }

  // ROLE-SPECIFIC METHODS

  async findRecruiters(
    skip?: number,
    take?: number,
    includeJobs: boolean = false
  ): Promise<ServiceResponse> {
    try {
      const recruiters = await this.prisma.user.findMany({
        where: { role: Role.RECRUITER, isActive: true },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          avatar: true,
          createdAt: true,
          recruiter: true,
          jobs: includeJobs ? {
            include: {
              applications: true,
              workAssignments: true,
            }
          } : false,
          recruiterAssignments: includeJobs,
        }
      });

      const totalCount = await this.prisma.user.count({
        where: { role: Role.RECRUITER, isActive: true }
      });

      return createSuccessResponse('Recruiters retrieved successfully', {
        totalCount,
        page: skip ? Math.floor(skip / (take || 10)) + 1 : 1,
        pageSize: take || recruiters.length,
        recruiters,
      });
    } catch (error) {
      return this.errorHandler.handleError(
        error,
        'UsersService',
        'find recruiters',
        'Failed to retrieve recruiters'
      );
    }
  }

  async findWorkers(
    skip?: number,
    take?: number,
    includeApplications: boolean = false
  ): Promise<ServiceResponse> {
    try {
      const workers = await this.prisma.user.findMany({
        where: { role: Role.WORKER, isActive: true },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          avatar: true,
          createdAt: true,
          worker: true,
          applications: includeApplications ? {
            include: {
              job: true,
            }
          } : false,
          workAssignments: includeApplications,
        }
      });

      const totalCount = await this.prisma.user.count({
        where: { role: Role.WORKER, isActive: true }
      });

      return createSuccessResponse('Workers retrieved successfully', {
        totalCount,
        page: skip ? Math.floor(skip / (take || 10)) + 1 : 1,
        pageSize: take || workers.length,
        workers,
      });
    } catch (error) {
      return this.errorHandler.handleError(
        error,
        'UsersService',
        'find workers',
        'Failed to retrieve workers'
      );
    }
  }

  // JOB-RELATED METHODS

  async getUserJobs(userId: number): Promise<ServiceResponse> {
    try {
      const user = await this.findUserOrThrow(userId);

      if (user.role !== Role.RECRUITER) {
        return badRequestError('Only recruiters can have jobs',);
      }

      const jobs = await this.prisma.job.findMany({
        where: { recruiterId: userId },
        include: {
          applications: {
            include: {
              worker: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                }
              }
            }
          },
          workAssignments: {
            include: {
              worker: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      return createSuccessResponse('User jobs retrieved successfully', jobs);
    } catch (error) {
      return this.errorHandler.handleError(
        error,
        'UsersService',
        'get user jobs',
        'Failed to retrieve user jobs'
      );
    }
  }

  async getUserApplications(userId: number): Promise<ServiceResponse> {
    try {
      const user = await this.findUserOrThrow(userId);

      if (user.role !== Role.WORKER) {
        return badRequestError('Only workers can have applications');
      }

      const applications = await this.prisma.application.findMany({
        where: { workerId: userId },
        include: {
          job: {
            include: {
              recruiter: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                }
              }
            }
          }
        },
        orderBy: { appliedAt: 'desc' }
      });

      return createSuccessResponse('User applications retrieved successfully', applications);
    } catch (error) {
      return this.errorHandler.handleError(
        error,
        'UsersService',
        'get user applications',
        'Failed to retrieve user applications'
      );
    }
  }

  async getUserWorkAssignments(userId: number): Promise<ServiceResponse> {
    try {
      const user = await this.findUserOrThrow(userId);

      let assignments;

      if (user.role === Role.WORKER) {
        assignments = await this.prisma.workAssignment.findMany({
          where: { workerId: userId },
          include: {
            job: true,
            recruiter: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        });
      } else if (user.role === Role.RECRUITER) {
        assignments = await this.prisma.workAssignment.findMany({
          where: { recruiterId: userId },
          include: {
            job: true,
            worker: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        });
      } else {
        return badRequestError('Only workers and recruiters can have work assignments');
      }

      return createSuccessResponse('Work assignments retrieved successfully', assignments);
    } catch (error) {
      return this.errorHandler.handleError(
        error,
        'UsersService',
        'get user work assignments',
        'Failed to retrieve work assignments'
      );
    }
  }

  // SEARCH AND FILTER METHODS

  async searchUsers(
    query: string,
    role?: Role,
    isActive?: boolean,
    skip?: number,
    take?: number
  ): Promise<ServiceResponse> {
    try {
      const whereClause: Prisma.UserWhereInput = {
        AND: [
          {
            OR: [
              { firstName: { contains: query, mode: 'insensitive' } },
              { lastName: { contains: query, mode: 'insensitive' } },
              { email: { contains: query, mode: 'insensitive' } },
            ]
          },
          role ? { role } : {},
          isActive !== undefined ? { isActive } : {},
        ]
      };

      const users = await this.prisma.user.findMany({
        where: whereClause,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          avatar: true,
          role: true,
          isActive: true,
          createdAt: true,
        }
      });

      const totalCount = await this.prisma.user.count({ where: whereClause });

      return createSuccessResponse('Search results retrieved successfully', {
        totalCount,
        page: skip ? Math.floor(skip / (take || 10)) + 1 : 1,
        pageSize: take || users.length,
        users,
      });
    } catch (error) {
      return this.errorHandler.handleError(
        error,
        'UsersService',
        'search users',
        'Failed to search users'
      );
    }
  }
}