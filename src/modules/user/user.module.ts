import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { UserTransformer } from './transformer/user.transformer';
import { RedisEmitterModule } from 'src/shared/modules/redis-emitter/redis-emitter.module';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]), RedisEmitterModule],
  controllers: [UserController],
  providers: [UserService, UserTransformer],
  exports: [UserTransformer, UserService]
})
export class UserModule { }
