import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CollectionService } from '../services/collections.service';
import { CollectionResolver } from '../resolvers/collections.resolver';
import { Collection, CollectionSchema } from '../schemas/collection.schema';
import { Request, RequestSchema } from '../schemas/request.schema';
import { UserModule } from '../modules/users.module';
import { RequestModule } from '../modules/requests.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Collection.name, schema: CollectionSchema },
      { name: Request.name, schema: RequestSchema },
    ]),
    forwardRef(() => UserModule),
    RequestModule,
  ],
  providers: [CollectionService, CollectionResolver],
  exports: [CollectionService],
})
export class CollectionModule {}