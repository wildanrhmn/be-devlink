import {
  Injectable,
  Inject,
  forwardRef,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Collection } from '../schemas/collection.schema';
import { Request } from '../schemas/request.schema';
import { Types } from 'mongoose';
import { Schema } from 'mongoose';
import { UserService } from './users.service';
import { User } from 'src/schemas/user.schema';

@Injectable()
export class CollectionService {
  constructor(
    @InjectModel(Collection.name) private collectionModel: Model<Collection>,
    @InjectModel(Request.name) private requestModel: Model<Request>,
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
  ) {}

  async findById(id: string, userId?: string) {
    const collection = await this.collectionModel.findById(id).exec();

    if (!collection) {
      throw new Error('Collection not found');
    }

    // Check authorization if userId is provided
    if (userId && !collection.isPublic) {
      const isOwner = collection.owner.toString() === userId;
      const isSharedWith = collection.sharedWith.some(
        (sharedId) => sharedId.toString() === userId,
      );

      if (!isOwner && !isSharedWith) {
        throw new Error('Not authorized to view this collection');
      }
    }

    return collection;
  }

  async findUserCollections(userId: string) {
    return this.collectionModel
      .find({
        $or: [
          { owner: new Types.ObjectId(userId) },
          { sharedWith: new Types.ObjectId(userId) },
        ],
      })
      .exec();
  }

  async findPublicCollections() {
    return this.collectionModel.find({ isPublic: true }).exec();
  }

  async create(name: string, userId: string, description?: string) {
    try {
      const user = await this.userService.findById(userId);

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const collection = new this.collectionModel({
        name,
        description,
        owner: new Types.ObjectId(userId),
        sharedWith: [],
        isPublic: false,
        requests: [],
      });

      const savedCollection = await collection.save();
      return savedCollection;
    } catch (error) {
      console.error('Error creating collection:', error);
      throw error;
    }
  }

  async update(
    id: string,
    userId: string,
    updateData: { name?: string; description?: string },
  ) {
    const collection = await this.findById(id);

    if (collection.owner.toString() !== userId) {
      throw new Error('Not authorized to update this collection');
    }

    if (Object.keys(updateData).length === 0) {
      return collection;
    }

    return this.collectionModel
      .findByIdAndUpdate(id, { $set: updateData }, { new: true })
      .exec();
  }

  async delete(id: string, userId: string) {
    const collection = await this.findById(id);

    if (collection.owner.toString() !== userId) {
      throw new Error('Not authorized to delete this collection');
    }

    // Delete all requests in this collection
    await this.requestModel.deleteMany({ collection: id });

    // Delete the collection
    await this.collectionModel.findByIdAndDelete(id).exec();

    return true;
  }

  async shareCollection(id: string, userId: string, userEmail: string) {
    const collection = await this.findById(id);

    if (collection.owner.toString() !== userId) {
      throw new Error('Not authorized to share this collection');
    }

    const userToShareWith = await this.userService.findByEmail(userEmail);

    if (!userToShareWith) {
      throw new Error('User not found');
    }

    const sharedUserId = (
      userToShareWith._id as unknown as Schema.Types.ObjectId
    ).toString();
    if (sharedUserId === userId) {
      throw new Error('Cannot share collection with yourself');
    }

    // Check if already shared
    const isAlreadyShared = collection.sharedWith.some(
      (sharedId) => sharedId.toString() === sharedUserId,
    );

    if (isAlreadyShared) {
      throw new Error('Collection already shared with this user');
    }

    return this.collectionModel
      .findByIdAndUpdate(
        id,
        { $addToSet: { sharedWith: userToShareWith._id } },
        { new: true },
      )
      .exec();
  }

  async setPublicStatus(id: string, userId: string, isPublic: boolean) {
    const collection = await this.findById(id);

    if (collection.owner.toString() !== userId) {
      throw new Error('Not authorized to update this collection');
    }

    return this.collectionModel
      .findByIdAndUpdate(id, { $set: { isPublic } }, { new: true })
      .exec();
  }

  async getCollectionOwner(collectionId: string) {
    const collection = await this.findById(collectionId);
    return this.userService.findById(collection.owner.toString());
  }

  async getSharedUsers(collectionId: string) {
    const collection = await this.findById(collectionId);
    if (!collection.sharedWith || collection.sharedWith.length === 0) {
      return [];
    }

    return Promise.all(
      collection.sharedWith.map((userId) =>
        this.userService.findById(userId.toString()),
      ),
    );
  }
}
