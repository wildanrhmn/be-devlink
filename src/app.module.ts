import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import appConfig from './app.config';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';

import { UserModule } from './modules/users.module';
import { CollectionModule } from './modules/collections.module';
import { RequestModule } from './modules/requests.module';
import { ResponseModule } from './modules/responses.module';
import { EnvironmentModule } from './modules/environments.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      playground: false,
      typePaths: [join(process.cwd(), 'src', '**', '*.graphql')],
      definitions: {
        path: join(process.cwd(), 'src/graphql.ts'),
        outputAs: 'class' as const,
      },
      plugins: [ApolloServerPluginLandingPageLocalDefault()],
      context: ({ req }) => ({ req }),
      introspection: true,
      cache: 'bounded',
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get('database.mongodbUri'),
      }),
      inject: [ConfigService],
    }),
    UserModule,
    CollectionModule,
    RequestModule,
    ResponseModule,
    EnvironmentModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
