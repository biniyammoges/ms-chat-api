import { Module } from '@nestjs/common';
import { FollowerController } from './follower.controller';
import { FollowerService } from './follower.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FollowerEntity } from './entities/follower.entity';
import { UserModule } from '../user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([FollowerEntity]), UserModule],
  controllers: [FollowerController],
  providers: [FollowerService],
  exports: [FollowerService]
})
export class FollowerModule { }
