import {
  Injectable,
  Logger,
} from '@nestjs/common';
import { handleErrorResponse, ServiceResponse } from '../utils/response.utils';

/**
 * Global error handler utility
 */
@Injectable()
export class ErrorHandlerService {
  private readonly logger = new Logger(ErrorHandlerService.name);

  /**
   * Handle errors consistently across the application
   * @param error The error object
   * @param service The service name (for logging)
   * @param operation The operation being performed (for error message)
   * @param defaultMessage Default error message if none provided
   * @returns ServiceResponse with appropriate error details
   */
  handleError(
    error: unknown,
    service: string,
    operation: string,
    defaultMessage = 'An error occurred'
  ): ServiceResponse {
    // Log the error (full details for debugging)
    if (error instanceof Error) {
      this.logger.error(`[${service}] ${operation}: ${error.message}`, error.stack);
    } else {
      this.logger.error(`[${service}] ${operation}: Unknown error`, error);
    }

    // Use our unified error response handler (clean response for client)
    return handleErrorResponse(error, defaultMessage);
  }
}