import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { PostGateway } from './post.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostEntity } from './entities/post.entity';
import { PostMediaEntity } from './entities/post-media.entity';
import { FollowerModule } from '../follower/follower.module';

@Module({
  imports: [TypeOrmModule.forFeature([PostEntity, PostMediaEntity]), FollowerModule],
  controllers: [PostController],
  providers: [PostService, PostGateway]
})
export class PostModule { }
