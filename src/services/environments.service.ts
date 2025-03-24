import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Environment, IEnvironment } from '../schemas/EnvironmentSchema';
import { EnvVariableInput } from '../graphql';

@Injectable()
export class EnvironmentService {
  constructor(
    @InjectModel(Environment.name) private environmentModel: Model<IEnvironment>,
  ) {}

  async findById(id: string, userId: string) {
    const environment = await this.environmentModel.findById(id).exec();
    
    if (!environment) {
      throw new Error('Environment not found');
    }

    if (environment.owner.toString() !== userId) {
      throw new Error('Not authorized to view this environment');
    }

    return environment;
  }

  async findUserEnvironments(userId: string) {
    return this.environmentModel.find({ owner: userId }).exec();
  }

  async create(name: string, userId: string, variables?: EnvVariableInput[]) {
    const environment = new this.environmentModel({
      name,
      variables: variables || [],
      owner: new Types.ObjectId(userId),
    });
    
    await environment.save();
    return environment;
  }

  async update(
    id: string,
    userId: string,
    updateData: {
      name?: string;
      variables?: EnvVariableInput[];
    }
  ) {
    const environment = await this.findById(id, userId);
    
    // User is already authorized by findById
    
    if (Object.keys(updateData).length === 0) {
      return environment;
    }

    return this.environmentModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    ).exec();
  }

  async delete(id: string, userId: string) {
    const environment = await this.findById(id, userId);
    
    // User is already authorized by findById
    
    await this.environmentModel.findByIdAndDelete(id).exec();
    
    return true;
  }
}