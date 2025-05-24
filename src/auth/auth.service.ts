import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { hash, compare } from 'bcryptjs';
import { Role } from '@prisma/client';
import { 
  createSuccessResponse, 
  notFoundError, 
  unauthorizedError, 
  conflictError 
} from '../utils/response.utils';
import { ErrorHandlerService } from '../utils/error.utils';
import { JwtPayload } from './types/jwt-payload.types';


@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly errorHandler: ErrorHandlerService,
  ) { }

  /**
   * Login user
   * @param loginDto - Login credentials
   */
  async login(loginDto: { email: string; password: string }) {
    try {
      // Find user by email
      const user = await this.prisma.user.findUnique({
        where: { email: loginDto.email },
        include: {
          recruiter: true,
          recruiterAssignments: true,
          jobs:true,
          applications:true
        },
      });

      if (!user) {
        return notFoundError('Invalid credentials');
      }

      // Verify password
      const isPasswordValid = await compare(loginDto.password, user.password);

      if (!isPasswordValid) {
        return unauthorizedError('Invalid credentials');
      }

      // Remove password from response
      const { password, ...userData } = user;

      // Generate token
      const token = this.generateToken(userData);

      return createSuccessResponse('Login successful', token);
    } catch (error) {
      return this.errorHandler.handleError(
        error,
        'AuthService',
        'login',
        'Login failed',
      );
    }
  }



  /**
   * Generate JWT token
   * @param user - User data to encode in token
   */
  private generateToken(user: JwtPayload) {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    return this.jwtService.sign(payload);
  }

  /**
   * Validate user for JWT strategy
   * @param userId - User ID from token
   */
  async validateUser(userId: number) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          recruiter: true,
          recruiterAssignments: true,
          jobs:true,
          applications:true
        },
      });

      if (!user) {
        return notFoundError('User not found');
      }

      // Remove password from response
      const { password, ...userData } = user;
      return createSuccessResponse('User validated', userData);
    } catch (error) {
      return this.errorHandler.handleError(
        error,
        'AuthService',
        'validateUser',
        'Failed to validate user'
      );
    }
  }
}