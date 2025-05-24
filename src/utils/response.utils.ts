import {
  NotFoundException,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
  HttpException,
  HttpStatus
} from '@nestjs/common';

/**
 * Standard service response interface
 */
export interface ServiceResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
  statusCode: number;
}

/**
 * Create a success response
 * @param message Success message
 * @param data Optional data payload
 * @returns ServiceResponse object
 */
export function createSuccessResponse(
  message: string,
  data?: unknown,
): ServiceResponse {
  return {
    success: true,
    statusCode: HttpStatus.OK,
    message,
    data
  };
}

/**
 * Create an error response
 * @param message Error message
 * @param statusCode HTTP status code
 * @param errorType Optional error type name
 * @returns ServiceResponse object
 */
export function createErrorResponse(
  message: string,
  statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR,
  errorType?: string
): ServiceResponse {
  return {
    success: false,
    message,
    error: errorType,
    statusCode
  };
}

/**
 * Create a specific type of error response (for direct usage)
 * Helper methods for different error types
 */

export function notFoundError(message: string): ServiceResponse {
  return createErrorResponse(message, HttpStatus.NOT_FOUND, 'NotFound');
}

export function badRequestError(message: string): ServiceResponse {
  return createErrorResponse(message, HttpStatus.BAD_REQUEST, 'BadRequest');
}

export function unauthorizedError(message: string): ServiceResponse {
  return createErrorResponse(message, HttpStatus.UNAUTHORIZED, 'Unauthorized');
}

export function forbiddenError(message: string): ServiceResponse {
  return createErrorResponse(message, HttpStatus.FORBIDDEN, 'Forbidden');
}

export function conflictError(message: string): ServiceResponse {
  return createErrorResponse(message, HttpStatus.CONFLICT, 'Conflict');
}

export function serverError(message: string): ServiceResponse {
  return createErrorResponse(message, HttpStatus.INTERNAL_SERVER_ERROR, 'InternalServerError');
}

/**
 * Helper to determine the appropriate error response based on error type
 * @param error The error object
 * @param defaultMessage Default message if none is provided
 * @returns ServiceResponse appropriate for the error type
 */
export function handleErrorResponse(error: unknown, defaultMessage = 'An error occurred'): ServiceResponse {
  let message = defaultMessage;
  
  if (error instanceof Error) {
    message = error.message || defaultMessage;
  }
  
  if (error instanceof NotFoundException) {
    return notFoundError(message);
  }
  
  if (error instanceof BadRequestException) {
    return badRequestError(message);
  }
  
  if (error instanceof UnauthorizedException) {
    return unauthorizedError(message);
  }
  
  if (error instanceof ForbiddenException) {
    return forbiddenError(message);
  }
  
  if (error instanceof ConflictException) {
    return conflictError(message);
  }
  
  if (error instanceof InternalServerErrorException) {
    return serverError(message);
  }
  
  if (error instanceof HttpException) {
    return createErrorResponse(message, error.getStatus(), error.name);
  }
  
  // Default case for unknown errors
  return serverError(message);
}