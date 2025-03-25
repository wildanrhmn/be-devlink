import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ResponseService } from '../services/responses.service';
import { ResponseResolver } from '../resolvers/responses.resolver';
import { Response, ResponseSchema } from '../schemas/response.schema';
import { Request, RequestSchema } from '../schemas/request.schema';
import { Collection, CollectionSchema } from '../schemas/collection.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Response.name, schema: ResponseSchema },
      { name: Request.name, schema: RequestSchema },
      { name: Collection.name, schema: CollectionSchema },
    ]),
  ],
  providers: [ResponseService, ResponseResolver],
  exports: [ResponseService],
})
export class ResponseModule {}