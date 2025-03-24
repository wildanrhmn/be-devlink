import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EnvironmentService } from '../services/environments.service';
import { EnvironmentResolver } from '../resolvers/environments.resolver';
import { Environment, EnvironmentSchema } from '../schemas/EnvironmentSchema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Environment.name, schema: EnvironmentSchema },
    ]),
  ],
  providers: [EnvironmentService, EnvironmentResolver],
  exports: [EnvironmentService],
})
export class EnvironmentModule {}