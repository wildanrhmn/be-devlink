import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ResponseService } from '../services/responses.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { HeaderInput } from '../graphql';
import { CurrentUser } from '../auth/current-user.decorator';
import { Schema } from 'mongoose';

@Resolver('Response')
export class ResponseResolver {
  constructor(
    private responseService: ResponseService,
  ) {}

  @Mutation('saveResponse')
  @UseGuards(JwtAuthGuard)
  async saveResponse(
    @Args('requestId') requestId: string,
    @Args('statusCode') statusCode: number,
    @Args('body') body: string,
    @Args('headers') headers: HeaderInput[],
    @CurrentUser() user,
  ) {
    const response = await this.responseService.saveResponse(
      requestId,
      user.userId,
      statusCode,
      body,
      headers,
    );
    return {
      ...response.toObject(),
      id: (response._id as Schema.Types.ObjectId).toString(),
    };
  }

  @Mutation('deleteResponse')
  @UseGuards(JwtAuthGuard)
  async deleteResponse(
    @Args('id') id: string,
    @CurrentUser() user,
  ) {
    return this.responseService.deleteResponse(id, user.userId);
  }
}