import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async checkConnection(): Promise<{ status: string; message: string }> {
    try {
      const isConnected = await this.appService.checkConnection();
      if (isConnected) {
        return {
          status: 'success',
          message: 'MongoDB connection established successfully'
        };
      } else {
        throw new HttpException(
          'Failed to establish MongoDB connection',
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
    } catch (error) {
      throw new HttpException(
        `Failed to establish MongoDB connection: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
