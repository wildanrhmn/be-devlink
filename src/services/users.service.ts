import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, IUser } from '../schemas/UserSchema';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { Collection, ICollection } from '../schemas/CollectionSchema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<IUser>,
    @InjectModel(Collection.name) private collectionModel: Model<ICollection>,
    private jwtService: JwtService,
  ) {}

  async findById(id: string) {
    return this.userModel.findById(id).exec();
  }

  async findByEmail(email: string) {
    return this.userModel.findOne({ email }).exec();
  }

  async findAll() {
    return this.userModel.find().exec();
  }

  async create(username: string, email: string, password: string) {
    // Check if user already exists
    const existingUser = await this.userModel.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      throw new Error('User already exists with that email or username');
    }
  
    // Create new user with hashed password
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new this.userModel({
      username,
      email,
      password: hashedPassword,
    });
    
    await user.save();
    
    return user;
  }

  async validateUser(email: string, password: string) {
    const user = await this.findByEmail(email);
    if (!user) {
      throw new Error('No user found with this email');
    }

    // Check password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new Error('Invalid password');
    }

    return user;
  }

  async generateToken(user: IUser) {
    const payload = { 
      sub: user._id, 
      email: user.email 
    };
    
    return this.jwtService.sign(payload);
  }

  async getUserCollections(userId: string) {
    return this.collectionModel.find({ owner: userId }).exec();
  }
}