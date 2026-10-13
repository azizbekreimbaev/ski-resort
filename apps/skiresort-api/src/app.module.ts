import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver } from '@nestjs/apollo';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppResolver } from './app.resolver';
import { ComponentsModule } from './components/components.module';
import { DatabaseModule } from './database/database.module';
import { formatGraphQLError } from './libs/graphql-error';
import { SocketModule } from './socket/socket.module';
import type { SessionContext } from './components/auth/session.config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    GraphQLModule.forRoot({
      driver: ApolloDriver,
      playground: true,
      uploads: true,
      autoSchemaFile: true,
      csrfPrevention: true,
      context: ({ req, res }: SessionContext) => ({ req, res }),
      formatError: formatGraphQLError,
    }),
    ComponentsModule,
    DatabaseModule,
    SocketModule,
  ],

  controllers: [AppController],
  providers: [AppService, AppResolver],
})
export class AppModule {}
