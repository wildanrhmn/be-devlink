import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { EnvironmentService } from '../services/environments.service';
import { EnvVariableInput } from '../graphql';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { Types } from 'mongoose';

@Resolver('Environment')
export class EnvironmentResolver {
  constructor(
    private environmentService: EnvironmentService,
  ) {}

  @Query('environment')
  @UseGuards(JwtAuthGuard)
  async getEnvironment(
    @Args('id') id: string,
    @CurrentUser() user,
  ) {
    const environment = await this.environmentService.findById(id, user.userId);
    if (!environment) throw new Error('Environment not found');
    
    return {
      ...environment.toObject(),
      id: (environment._id as Types.ObjectId).toString(),
    };
  }

  @Query('environments')
  @UseGuards(JwtAuthGuard)
  async getEnvironments(@CurrentUser() user) {
    const environments = await this.environmentService.findUserEnvironments(user.userId);
    return environments.map(environment => ({
      ...environment.toObject(),
      id: (environment._id as Types.ObjectId).toString(),
    }));
  }

  @Mutation('createEnvironment')
  @UseGuards(JwtAuthGuard)
  async createEnvironment(
    @Args('name') name: string,
    @Args('variables') variables: EnvVariableInput[],
    @CurrentUser() user,
  ) {
    const environment = await this.environmentService.create(
      name,
      user.userId,
      variables,
    );
    return {
      ...environment.toObject(),
      id: (environment._id as Types.ObjectId).toString(),
    };
  }

  @Mutation('updateEnvironment')
  @UseGuards(JwtAuthGuard)
  async updateEnvironment(
    @Args('id') id: string,
    @Args('name') name: string,
    @Args('variables') variables: EnvVariableInput[],
    @CurrentUser() user,
  ) {
    const environment = await this.environmentService.update(
      id,
      user.userId,
      { name, variables },
    );
    if (!environment) throw new Error('Environment not found');
    
    return {
      ...environment.toObject(),
      id: (environment._id as Types.ObjectId).toString(),
    };
  }

  @Mutation('deleteEnvironment')
  @UseGuards(JwtAuthGuard)
  async deleteEnvironment(
    @Args('id') id: string,
    @CurrentUser() user,
  ) {
    return this.environmentService.delete(id, user.userId);
  }
}