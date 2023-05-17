import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { globalConfig } from './config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './modules/auth/guards/at.guard';
import { AppController } from './app.controller';
import { FollowerModule } from './modules/follower/follower.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [globalConfig],
      envFilePath: ['.env', '.env.local', `.env.${process.env.NODE_ENV}.local`]
    }), TypeOrmModule.forRootAsync({
      async useFactory(...args) {
        const ds = await import('./typeorm.ds');
        return ds.ds
      },
    }), AuthModule, UserModule, FollowerModule,],
  controllers: [AppController],
  providers: [{ provide: APP_GUARD, useValue: JwtAuthGuard }]
})
export class AppModule { }
