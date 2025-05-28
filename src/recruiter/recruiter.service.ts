import { Injectable } from '@nestjs/common';
import { CreateRecruiterDto } from './dto/create-recruiter.dto';
import { UpdateRecruiterDto } from './dto/update-recruiter.dto';
import { PrismaService } from '../prisma/prisma.service';
import { ErrorHandlerService } from '../utils/error.utils';
import { Prisma } from '@prisma/client';
import { 
  createSuccessResponse, 
  notFoundError, 
  badRequestError, 
  conflictError,  
} from 'src/utils/response.utils';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class RecruiterService {
  private readonly SALT_ROUNDS = 10;

  constructor(
    private readonly prisma: PrismaService,
    private readonly errorHandler: ErrorHandlerService,
  ) {}

   private async hashPassword(password: string): Promise<string> {
      return bcrypt.hash(password, this.SALT_ROUNDS);
    }

  async create(createRecruiterDto: CreateRecruiterDto) {
    try {
      // Check if email already exists
      const existingUser = await this.prisma.user.findUnique({
        where: { email: createRecruiterDto.email }
      });

      if (existingUser) {
        return conflictError('User with this email already exists');
      }

       const hashedPassword = await this.hashPassword(createRecruiterDto.password);

      // Create user and recruiter in a transaction
      const result = await this.prisma.$transaction(async (prisma) => {
        // Create user first
        const user = await prisma.user.create({
          data: {
            email: createRecruiterDto.email,
            password: hashedPassword, 
            firstName: createRecruiterDto.firstName,
            lastName: createRecruiterDto.lastName,
            phone: createRecruiterDto.phone,
            avatar: createRecruiterDto.avatar,
            role: 'RECRUITER', 
          }
        });

        // Create recruiter with the new user's ID
        const recruiter = await prisma.recruiter.create({
          data: {
            userId: user.id,
            companyName: createRecruiterDto.companyName,
            type: createRecruiterDto.type,
            description: createRecruiterDto.description,
            location: createRecruiterDto.location,
            website: createRecruiterDto.website,
            verified: createRecruiterDto.verified || false,
          },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
                avatar: true,
                role: true,
              }
            }
          }
        });

        return recruiter;
      });

      return createSuccessResponse('Recruiter and user created successfully', result);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          return conflictError('User with this email already exists');
        }
      }

      return this.errorHandler.handleError(
        error,
        'RecruiterService',
        'create',
        'Failed to create recruiter and user'
      );
    }
  }
  async findAll(page: number = 1, limit: number = 25, filters?: {
    type?: string;
    location?: string;
    verified?: boolean;
    search?: string;
  }) {
    try {
      const skip = (page - 1) * limit;
      
      const where: Prisma.RecruiterWhereInput = {};

      if (filters?.type) {
        where.type = filters.type as any;
      }

      if (filters?.location) {
        where.location = {
          contains: filters.location,
          mode: 'insensitive',
        };
      }

      if (filters?.verified !== undefined) {
        where.verified = filters.verified;
      }

      if (filters?.search) {
        where.OR = [
          {
            companyName: {
              contains: filters.search,
              mode: 'insensitive',
            },
          },
          {
            description: {
              contains: filters.search,
              mode: 'insensitive',
            },
          },
          {
            user: {
              OR: [
                {
                  firstName: {
                    contains: filters.search,
                    mode: 'insensitive',
                  },
                },
                {
                  lastName: {
                    contains: filters.search,
                    mode: 'insensitive',
                  },
                },
              ],
            },
          },
        ];
      }

      const [recruiters, total] = await Promise.all([
        this.prisma.recruiter.findMany({
          where,
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                avatar: true,
              }
            }
          },
          skip,
          take: limit,
          orderBy: {
            createdAt: 'desc',
          },
        }),
        this.prisma.recruiter.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return createSuccessResponse('Recruiters retrieved successfully', {
        recruiters,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: total,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      });
    } catch (error) {
      return this.errorHandler.handleError(
        error,
        'RecruiterService',
        'findAll',
        'Failed to retrieve recruiters'
      );
    }
  }

  async findOne(id: number) {
    try {
      const recruiter = await this.prisma.recruiter.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              avatar: true,
            }
          }
        },
      });

      if (!recruiter) {
        return notFoundError('Recruiter not found');
      }

      return createSuccessResponse('Recruiter retrieved successfully', recruiter);
    } catch (error) {
      return this.errorHandler.handleError(
        error,
        'RecruiterService',
        'findOne',
        'Failed to retrieve recruiter'
      );
    }
  }

  async findByUserId(userId: number) {
    try {
      const recruiter = await this.prisma.recruiter.findUnique({
        where: { userId},
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              avatar: true,
            }
          }
        },
      });

      if (!recruiter) {
        return notFoundError('Recruiter profile not found for this user');
      }

      return createSuccessResponse('Recruiter retrieved successfully', recruiter);
    } catch (error) {
      return this.errorHandler.handleError(
        error,
        'RecruiterService',
        'findByUserId',
        'Failed to retrieve recruiter by user ID'
      );
    }
  }

  async update(id: number, updateRecruiterDto: UpdateRecruiterDto) {
    try {
      // Check if recruiter exists
      const existingRecruiter = await this.prisma.recruiter.findUnique({
        where: { id },
      });

      if (!existingRecruiter) {
        return notFoundError('Recruiter not found');
      }

      // If updating userId, check if new user exists and doesn't already have a recruiter profile
      if (updateRecruiterDto.userId && updateRecruiterDto.userId !== existingRecruiter.userId) {
        const userExists = await this.prisma.user.findUnique({
          where: { id: updateRecruiterDto.userId }
        });

        if (!userExists) {
          return badRequestError('User does not exist');
        }

        const existingRecruiterForUser = await this.prisma.recruiter.findUnique({
          where: { userId: updateRecruiterDto.userId }
        });

        if (existingRecruiterForUser) {
          return conflictError('Another recruiter profile already exists for this user');
        }
      }

      const updatedRecruiter = await this.prisma.recruiter.update({
        where: { id },
        data: {
          ...(updateRecruiterDto.userId && { userId: updateRecruiterDto.userId }),
          ...(updateRecruiterDto.companyName !== undefined && { companyName: updateRecruiterDto.companyName }),
          ...(updateRecruiterDto.type && { type: updateRecruiterDto.type }),
          ...(updateRecruiterDto.description !== undefined && { description: updateRecruiterDto.description }),
          ...(updateRecruiterDto.location !== undefined && { location: updateRecruiterDto.location }),
          ...(updateRecruiterDto.website !== undefined && { website: updateRecruiterDto.website }),
          ...(updateRecruiterDto.verified !== undefined && { verified: updateRecruiterDto.verified }),
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
        },
      });

      return createSuccessResponse('Recruiter updated successfully', updatedRecruiter);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          return conflictError('Recruiter profile already exists for this user');
        }
        if (error.code === 'P2003') {
          return badRequestError('Invalid user ID provided');
        }
        if (error.code === 'P2025') {
          return notFoundError('Recruiter not found');
        }
      }

      return this.errorHandler.handleError(
        error,
        'RecruiterService',
        'update',
        'Failed to update recruiter'
      );
    }
  }

  async remove(id: number) {
    try {
      const existingRecruiter = await this.prisma.recruiter.findUnique({
        where: { id },
      });

      if (!existingRecruiter) {
        return notFoundError('Recruiter not found');
      }

      await this.prisma.recruiter.delete({
        where: { id },
      });

      return createSuccessResponse('Recruiter deleted successfully');
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          return notFoundError('Recruiter not found');
        }
      }

      return this.errorHandler.handleError(
        error,
        'RecruiterService',
        'remove',
        'Failed to delete recruiter'
      );
    }
  }

  async verifyRecruiter(id: number) {
    try {
      const recruiter = await this.prisma.recruiter.findUnique({
        where: { id },
      });

      if (!recruiter) {
        return notFoundError('Recruiter not found');
      }

      const updatedRecruiter = await this.prisma.recruiter.update({
        where: { id },
        data: { verified: true },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              avatar: true,

            }
          }
        },
      });

      return createSuccessResponse('Recruiter verified successfully', updatedRecruiter);
    } catch (error) {
      return this.errorHandler.handleError(
        error,
        'RecruiterService',
        'verifyRecruiter',
        'Failed to verify recruiter'
      );
    }
  }

  async unverifyRecruiter(id: number) {
    try {
      const recruiter = await this.prisma.recruiter.findUnique({
        where: { id },
      });

      if (!recruiter) {
        return notFoundError('Recruiter not found');
      }

      const updatedRecruiter = await this.prisma.recruiter.update({
        where: { id },
        data: { verified: false },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              avatar: true,
              
            }
          }
        },
      });

      return createSuccessResponse('Recruiter unverified successfully', updatedRecruiter);
    } catch (error) {
      return this.errorHandler.handleError(
        error,
        'RecruiterService',
        'unverifyRecruiter',
        'Failed to unverify recruiter'
      );
    }
  }

  async getRecruiterStats() {
    try {
      const [total, verified, byType] = await Promise.all([
        this.prisma.recruiter.count(),
        this.prisma.recruiter.count({ where: { verified: true } }),
        this.prisma.recruiter.groupBy({
          by: ['type'],
          _count: {
            type: true,
          },
        }),
      ]);

      const stats = {
        total,
        verified,
        unverified: total - verified,
        byType: byType.reduce((acc, item) => {
          acc[item.type] = item._count.type;
          return acc;
        }, {} as Record<string, number>),
      };

      return createSuccessResponse('Recruiter statistics retrieved successfully', stats);
    } catch (error) {
      return this.errorHandler.handleError(
        error,
        'RecruiterService',
        'getRecruiterStats',
        'Failed to retrieve recruiter statistics'
      );
    }
  }
}