import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Response, IResponse } from '../schemas/ResponseSchema';
import { Request, IRequest } from '../schemas/RequestSchema';
import { Collection, ICollection } from '../schemas/CollectionSchema';
import { HeaderInput } from '../graphql';

@Injectable()
export class ResponseService {
  constructor(
    @InjectModel(Response.name) private responseModel: Model<IResponse>,
    @InjectModel(Request.name) private requestModel: Model<IRequest>,
    @InjectModel(Collection.name) private collectionModel: Model<ICollection>,
  ) {}

  async findById(id: string, userId: string) {
    const response = await this.responseModel.findById(id).exec();
    
    if (!response) {
      throw new Error('Response not found');
    }

    // Check if user has access to the request and collection
    const request = await this.requestModel.findById(response.request).exec();
    if (!request) {
      throw new Error('Associated request not found');
    }

    const collection = await this.collectionModel.findById(request.collection).exec();
    if (!collection) {
      throw new Error('Associated collection not found');
    }

    if (!collection.isPublic) {
      const isOwner = collection.owner.toString() === userId;
      const isSharedWith = collection.sharedWith.some(
        sharedId => sharedId.toString() === userId
      );
      
      if (!isOwner && !isSharedWith) {
        throw new Error('Not authorized to view this response');
      }
    }

    return response;
  }

  async saveResponse(requestId: string, userId: string, statusCode: number, body: string, headers: HeaderInput[]) {
    // Check if user has access to the request
    const request = await this.requestModel.findById(requestId).exec();
    if (!request) {
      throw new Error('Request not found');
    }

    const collection = await this.collectionModel.findById(request.collection).exec();
    if (!collection) {
      throw new Error('Associated collection not found');
    }

    if (!collection.isPublic) {
      const isOwner = collection.owner.toString() === userId;
      const isSharedWith = collection.sharedWith.some(
        sharedId => sharedId.toString() === userId
      );
      
      if (!isOwner && !isSharedWith) {
        throw new Error('Not authorized to save response for this request');
      }
    }

    const response = new this.responseModel({
      statusCode,
      body,
      headers,
      request: requestId,
      timestamp: new Date(),
    });
    
    await response.save();
    return response;
  }

  async deleteResponse(id: string, userId: string) {
    const response = await this.findById(id, userId);
    
    // User is already authorized by findById
    
    await this.responseModel.findByIdAndDelete(id).exec();
    
    return true;
  }
}