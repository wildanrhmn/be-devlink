import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RequestService } from '../services/requests.service';
import { RequestResolver } from '../resolvers/requests.resolver';
import { Request, RequestSchema } from '../schemas/RequestSchema';
import { Collection, CollectionSchema } from '../schemas/CollectionSchema';
import { Response, ResponseSchema } from '../schemas/ResponseSchema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Request.name, schema: RequestSchema },
      { name: Collection.name, schema: CollectionSchema },
      { name: Response.name, schema: ResponseSchema },
    ]),
  ],
  providers: [RequestService, RequestResolver],
  exports: [RequestService],
})
export class RequestModule {}