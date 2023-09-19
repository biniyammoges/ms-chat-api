import { MiddlewareConsumer, Module, NestModule, } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { globalConfig } from './config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './modules/auth/guards/at.guard';
import { AppController } from './app.controller';
import { FollowerModule } from './modules/follower/follower.module';
import { FileModule } from './modules/file/file.module';
import { PostModule } from './modules/post/post.module';
import './virtual-column.polyfill'
import { SocketStateModule } from './shared/modules/socket-state/socket-state.module';
import { RedisModule } from './shared/modules/redis/redis.module';
import { RedisEmitterModule } from './shared/modules/redis-emitter/redis-emitter.module';
import { LoggerMiddleware } from './middlewares/logger.middleware';
import { NotificationModule } from './modules/notification/notification.module';
import { ChatModule } from './modules/chat/chat.module';
import { StoryModule } from './modules/story/story.module';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [globalConfig],
      envFilePath: ['.env', '.env.local', `.env.${process.env.NODE_ENV}.local`]
    }),
    TypeOrmModule.forRootAsync({
      async useFactory(...args) {
        const ds = await import('./typeorm.ds');
        return ds.ds
      },
    }),
    AuthModule,
    UserModule,
    FollowerModule,
    FileModule,
    PostModule,
    RedisModule,
    RedisEmitterModule,
    SocketStateModule,
    NotificationModule,
    ChatModule,
    StoryModule],
  controllers: [AppController],
  providers: [{ provide: APP_GUARD, useValue: JwtAuthGuard }, AppService],
  exports: []
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
