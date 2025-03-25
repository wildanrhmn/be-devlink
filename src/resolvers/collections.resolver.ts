import { Resolver, Query, Mutation, Args, ResolveField, Parent, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CollectionService } from '../services/collections.service';
import { RequestService } from '../services/requests.service';
import { UserService } from '../services/users.service';
import { Collection } from '../graphql';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { Types } from 'mongoose';

@Resolver('Collection')
export class CollectionResolver {
  constructor(
    private collectionService: CollectionService,
    private requestService: RequestService,
    private userService: UserService,
  ) {}

  @Query('collection')
  async getCollection(
    @Args('id') id: string,
    @Context() context,
  ) {
    const userId = context.req.user?.userId;
    const collection = await this.collectionService.findById(id, userId);
    return {
      ...collection.toObject(),
      id: (collection._id as Types.ObjectId).toString(),
    };
  }

  @Query('collections')
  @UseGuards(JwtAuthGuard)
  async getCollections(@CurrentUser() user) {
    const collections = await this.collectionService.findUserCollections(user.userId);
    return collections.map(collection => ({
      ...collection.toObject(),
      id: (collection._id as Types.ObjectId).toString(),
    }));
  }

  @Query('publicCollections')
  async getPublicCollections() {
    const collections = await this.collectionService.findPublicCollections();
    return collections.map(collection => ({
      ...collection.toObject(),
      id: (collection._id as Types.ObjectId).toString(),
    }));
  }

  @Mutation('createCollection')
  @UseGuards(JwtAuthGuard)
  async createCollection(
    @Args('name') name: string,
    @Args('description') description: string,
    @CurrentUser() user,
  ) {
    console.log({
      message: "Creating collection",
      userId: user,
      name,
      description
    });
    const collection = await this.collectionService.create(
      name,
      user.userId,
      description,
    );
    return {
      ...collection.toObject(),
      id: (collection._id as Types.ObjectId).toString(),
    };
  }

  @Mutation('updateCollection')
  @UseGuards(JwtAuthGuard)
  async updateCollection(
    @Args('id') id: string,
    @Args('name') name: string,
    @Args('description') description: string,
    @CurrentUser() user,
  ) {
    const collection = await this.collectionService.update(
      id,
      user.userId,
      { name, description },
    );
    if (!collection) throw new Error('Collection not found');
    
    return {
      ...collection.toObject(),
      id: (collection._id as Types.ObjectId).toString(),
    };
  }

  @Mutation('deleteCollection')
  @UseGuards(JwtAuthGuard)
  async deleteCollection(
    @Args('id') id: string,
    @CurrentUser() user,
  ) {
    return this.collectionService.delete(id, user.userId);
  }

  @Mutation('shareCollection')
  @UseGuards(JwtAuthGuard)
  async shareCollection(
    @Args('id') id: string,
    @Args('userEmail') userEmail: string,
    @CurrentUser() user,
  ) {
    const collection = await this.collectionService.shareCollection(
      id,
      user.userId,
      userEmail,
    );
    if (!collection) throw new Error('Collection not found');
    
    return {
      ...collection.toObject(),
      id: (collection._id as Types.ObjectId).toString(),
    };
  }

  @Mutation('makeCollectionPublic')
  @UseGuards(JwtAuthGuard)
  async makeCollectionPublic(
    @Args('id') id: string,
    @Args('isPublic') isPublic: boolean,
    @CurrentUser() user,
  ) {
    const collection = await this.collectionService.setPublicStatus(
      id,
      user.userId,
      isPublic,
    );
    if (!collection) throw new Error('Collection not found');
    
    return {
      ...collection.toObject(),
      id: (collection._id as Types.ObjectId).toString(),
    };
  }

  // Resolver for the nested "owner" field on Collection type
  @ResolveField('owner')
  async owner(@Parent() collection) {
    const owner = await this.userService.findById(collection.owner);
    if (!owner) throw new Error('Owner not found');
    
    return {
      id: (owner._id as Types.ObjectId).toString(),
      username: owner.username,
      email: owner.email,
    };
  }

  // Resolver for the nested "requests" field on Collection type
  @ResolveField('requests')
  async requests(@Parent() collection, @Context() context) {
    const userId = context.req.user?.userId;
    const requests = await this.requestService.findByCollection(collection.id, userId);
    return requests.map(request => ({
      ...request.toObject(),
      id: (request._id as Types.ObjectId).toString(),
    }));
  }

  // Resolver for the nested "sharedWith" field on Collection type
  @ResolveField('sharedWith')
  async sharedWith(@Parent() collection) {
    const users = await this.collectionService.getSharedUsers(collection.id);
    return users.filter(user => user !== null).map(user => ({
      id: (user._id as Types.ObjectId).toString(),
      username: user.username,
      email: user.email,
    }));
  }
}