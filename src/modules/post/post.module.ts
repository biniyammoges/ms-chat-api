import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { PostGateway } from './post.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostEntity } from './entities/post.entity';
import { PostMediaEntity } from './entities/post-media.entity';
import { FollowerModule } from '../follower/follower.module';
import { PostLikeEntity } from './entities/post-like.entity';
import { CommentEntity } from './entities/comment.entity';
import { CommentLikeEntity } from './entities/comment-like.entity';
import { SavedPostEntity } from './entities/saved-post.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PostEntity, PostMediaEntity, PostLikeEntity, CommentEntity, CommentLikeEntity, SavedPostEntity]), FollowerModule],
  controllers: [PostController],
  providers: [PostService, PostGateway]
})
export class PostModule { }
