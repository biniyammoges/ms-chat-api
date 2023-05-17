import { Module } from '@nestjs/common';
import { FollowerController } from './follower.controller';
import { FollowerService } from './follower.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FollowerEntity } from './entities/follower.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FollowerEntity])],
  controllers: [FollowerController],
  providers: [FollowerService]
})
export class FollowerModule { }
