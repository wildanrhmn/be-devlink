import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserService } from '../services/users.service';
import { UserResolver } from '../resolvers/users.resolver';
import { User, UserSchema } from '../schemas/UserSchema';
import { Collection, CollectionSchema } from '../schemas/CollectionSchema';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CollectionModule } from './collections.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
    ]),
    JwtModule.registerAsync({
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: '7d',
        },
      }),
      inject: [ConfigService],
    }),
    forwardRef(() => CollectionModule),
  ],
  providers: [UserService, UserResolver],
  exports: [UserService],
})
export class UserModule {}