import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { Logger } from '@nestjs/common';

@Injectable()
export class AppService implements OnModuleInit {
  private readonly logger = new Logger(AppService.name);

  constructor(@InjectConnection() private connection: Connection) {}

  async onModuleInit() {
    try {
      const isConnected = this.connection.readyState === 1;
      if (isConnected) {
        this.logger.log('MongoDB connection established successfully');
      } else {
        this.logger.error('MongoDB connection failed');
      }
      return isConnected;
    } catch (error) {
      this.logger.error('Error checking MongoDB connection:', error);
      return false;
    }
  }

  async checkConnection(): Promise<boolean> {
    return this.onModuleInit();
  }
}
