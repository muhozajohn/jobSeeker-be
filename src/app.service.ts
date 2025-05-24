import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): {
    author: string;
    message: string;
    version: string;
    timestamp: string;
  } {
    return {
      author: 'John Muhoza',
      message: 'Events Venue Management System API!',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    };
  }
}
