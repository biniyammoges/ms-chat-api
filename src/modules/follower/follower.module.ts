import { Module } from '@nestjs/common';
import { FollowerController } from './follower.controller';
import { FollowerService } from './follower.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FollowerEntity } from './entities/follower.entity';
import { UserModule } from '../user/user.module';
import { FollowerTransformer } from './transformers/follower.transformer';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [TypeOrmModule.forFeature([FollowerEntity]), UserModule, NotificationModule],
  controllers: [FollowerController],
  providers: [FollowerService, FollowerTransformer],
  exports: [FollowerService, FollowerTransformer]
})
export class FollowerModule { }
