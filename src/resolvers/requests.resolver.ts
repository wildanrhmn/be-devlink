import { Resolver, Query, Mutation, Args, ResolveField, Parent } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { RequestService } from '../services/requests.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { HeaderInput, ParamInput } from '../graphql';
import { CurrentUser } from '../auth/current-user.decorator';
import { Schema } from 'mongoose';

@Resolver('Request')
export class RequestResolver {
  constructor(
    private requestService: RequestService,
  ) {}

  @Query('request')
  @UseGuards(JwtAuthGuard)
  async getRequest(
    @Args('id') id: string,
    @CurrentUser() user,
  ) {
    const request = await this.requestService.findById(id, user.userId);
    if (!request) throw new Error('Request not found');
    
    return {
      ...request.toObject(),
      id: (request._id as Schema.Types.ObjectId).toString(),
    };
  }

  @Query('requests')
  @UseGuards(JwtAuthGuard)
  async getRequests(
    @Args('collectionId') collectionId: string,
    @CurrentUser() user,
  ) {
    const requests = await this.requestService.findByCollection(collectionId, user.userId);
    return requests.map(request => ({
      ...request.toObject(),
      id: (request._id as Schema.Types.ObjectId).toString(),
    }));
  }

  @Mutation('createRequest')
  @UseGuards(JwtAuthGuard)
  async createRequest(
    @Args('collectionId') collectionId: string,
    @Args('name') name: string,
    @Args('method') method: string,
    @Args('url') url: string,
    @Args('headers') headers: HeaderInput[],
    @Args('params') params: ParamInput[],
    @Args('body') body: string,
    @Args('notes') notes: string,
    @CurrentUser() user,
  ) {
    const request = await this.requestService.create(
      collectionId,
      user.userId,
      name,
      method,
      url,
      headers,
      params,
      body,
      notes,
    );
    return {
      ...request.toObject(),
      id: (request._id as Schema.Types.ObjectId).toString(),
    };
  }

  @Mutation('updateRequest')
  @UseGuards(JwtAuthGuard)
  async updateRequest(
    @Args('id') id: string,
    @Args('name') name: string,
    @Args('method') method: string,
    @Args('url') url: string,
    @Args('headers') headers: HeaderInput[],
    @Args('params') params: ParamInput[],
    @Args('body') body: string,
    @Args('notes') notes: string,
    @CurrentUser() user,
  ) {
    const request = await this.requestService.update(
      id,
      user.userId,
      {
        name,
        method,
        url,
        headers,
        params,
        body,
        notes,
      },
    );
    if (!request) throw new Error('Request not found');
    
    return {
      ...request.toObject(),
      id: (request._id as Schema.Types.ObjectId).toString(),
    };
  }

  @Mutation('deleteRequest')
  @UseGuards(JwtAuthGuard)
  async deleteRequest(
    @Args('id') id: string,
    @CurrentUser() user,
  ) {
    return this.requestService.delete(id, user.userId);
  }

  // Resolver for the nested "responses" field on Request type
  @ResolveField('responses')
  async responses(@Parent() request) {
    const responses = await this.requestService.getResponses(request.id);
    return responses.map(response => ({
      ...response.toObject(),
      id: (response._id as Schema.Types.ObjectId).toString(),
    }));
  }
}