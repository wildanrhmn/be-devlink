import { Resolver, Query, Mutation, Args, Parent, ResolveField } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { UserService } from '../services/users.service';
import { CollectionService } from '../services/collections.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthPayload } from '../graphql';
import { CurrentUser } from '../auth/current-user.decorator';
import { Types } from 'mongoose';

@Resolver('User')
export class UserResolver {
  constructor(
    private userService: UserService,
    private collectionService: CollectionService,
  ) {}

  @Query('me')
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser() user) {
    const userEntity = await this.userService.findById(user.userId);
    if (!userEntity) throw new Error('User not found');
    
    return {
      id: (userEntity._id as Types.ObjectId).toString(),
      username: userEntity.username,
      email: userEntity.email,
      collections: [] // Add empty collections array to satisfy User type
    };
  }

  @Query('user')
  @UseGuards(JwtAuthGuard)
  async getUser(@Args('id') id: string, @CurrentUser() currentUser) {
    const userEntity = await this.userService.findById(id);
    if (!userEntity) throw new Error('User not found');
    
    return {
      id: (userEntity._id as Types.ObjectId).toString(),
      username: userEntity.username,
      email: userEntity.email,
      collections: [] // Add empty collections array to satisfy User type
    };
  }

  @Mutation('signup')
  async signup(
    @Args('username') username: string,
    @Args('email') email: string,
    @Args('password') password: string,
  ): Promise<AuthPayload> {
    const user = await this.userService.create(username, email, password);
    const token = await this.userService.generateToken(user);
    
    return {
      token,
      user: {
        id: (user._id as Types.ObjectId).toString(),
        username: user.username,
        email: user.email,
        collections: [] // Add empty collections array to satisfy User type
      },
    };
  }

  @Mutation('login')
  async login(
    @Args('email') email: string,
    @Args('password') password: string,
  ): Promise<AuthPayload> {    
    const user = await this.userService.validateUser(email, password);
    const token = await this.userService.generateToken(user);
    
    return {
      token,
      user: {
        id: (user._id as Types.ObjectId).toString(),
        username: user.username,
        email: user.email,
        collections: [] // Add empty collections array to satisfy User type
      },
    };
  }

  // Resolver for the nested "collections" field on User type
  @ResolveField('collections')
  async collections(@Parent() user) {
    const collections = await this.collectionService.findUserCollections(user.id);
    return collections.map(collection => ({
      ...collection.toObject(),
      id: (collection._id as Types.ObjectId).toString(),
    }));
  }
}