import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Request, IRequest } from '../schemas/RequestSchema';
import { Collection, ICollection } from '../schemas/CollectionSchema';
import { Response, IResponse } from '../schemas/ResponseSchema';
import { HeaderInput, ParamInput } from '../graphql';

@Injectable()
export class RequestService {
  constructor(
    @InjectModel(Request.name) private requestModel: Model<IRequest>,
    @InjectModel(Collection.name) private collectionModel: Model<ICollection>,
    @InjectModel(Response.name) private responseModel: Model<IResponse>,
  ) {}

  async findById(id: string, userId: string) {
    const request = await this.requestModel.findById(id).exec();
    
    if (!request) {
      throw new Error('Request not found');
    }

    // Check if user has access to the collection containing this request
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
        throw new Error('Not authorized to view this request');
      }
    }

    return request;
  }

  async findByCollection(collectionId: string, userId: string) {
    // Check if user has access to the collection
    const collection = await this.collectionModel.findById(collectionId).exec();
    
    if (!collection) {
      throw new Error('Collection not found');
    }

    if (!collection.isPublic) {
      const isOwner = collection.owner.toString() === userId;
      const isSharedWith = collection.sharedWith.some(
        sharedId => sharedId.toString() === userId
      );
      
      if (!isOwner && !isSharedWith) {
        throw new Error('Not authorized to view requests in this collection');
      }
    }

    return this.requestModel.find({ collection: collectionId }).sort({ _id: -1 }).exec();
  }

  async create(
    collectionId: string, 
    userId: string,
    name: string,
    method: string,
    url: string,
    headers?: HeaderInput[],
    params?: ParamInput[],
    body?: string,
    notes?: string
  ) {
    // Check if user has access to the collection
    const collection = await this.collectionModel.findById(collectionId).exec();
    
    if (!collection) {
      throw new Error('Collection not found');
    }

    const isOwner = collection.owner.toString() === userId;
    const isSharedWith = collection.sharedWith.some(
      sharedId => sharedId.toString() === userId
    );
    
    if (!isOwner && !isSharedWith) {
      throw new Error('Not authorized to add to this collection');
    }

    const request = new this.requestModel({
      name,
      method,
      url,
      headers: headers || [],
      params: params || [],
      body,
      notes,
      collection: collectionId,
    });
    
    await request.save();
    return request;
  }

  async update(
    id: string,
    userId: string,
    updateData: {
      name?: string;
      method?: string;
      url?: string;
      headers?: HeaderInput[];
      params?: ParamInput[];
      body?: string;
      notes?: string;
    }
  ) {
    const request = await this.findById(id, userId);
    
    // User is already authorized by findById
    
    if (Object.keys(updateData).length === 0) {
      return request;
    }

    return this.requestModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    ).exec();
  }

  async delete(id: string, userId: string) {
    const request = await this.findById(id, userId);
    
    // User is already authorized by findById
    
    // Delete all responses for this request
    await this.responseModel.deleteMany({ request: id });
    
    // Delete the request
    await this.requestModel.findByIdAndDelete(id).exec();
    
    return true;
  }

  async getResponses(requestId: string) {
    return this.responseModel.find({ request: requestId }).exec();
  }
}