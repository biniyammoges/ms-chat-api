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
import { RedisEmitterModule } from '../../shared/modules/redis-emitter/redis-emitter.module';
import { SocketStateModule } from '../../shared/modules/socket-state/socket-state.module';
import { UserModule } from '../user/user.module';
import { PostTransformer } from './transformers/post.transformer';
import { PostLikeTransformer } from './transformers/like.transformer';
import { CommentTransformer } from './transformers/comment.transformer';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PostEntity, PostMediaEntity, PostLikeEntity, CommentEntity, CommentLikeEntity, SavedPostEntity]),
    FollowerModule, RedisEmitterModule, SocketStateModule, UserModule],
  controllers: [PostController],
  providers: [PostService, PostGateway, PostTransformer, PostLikeTransformer, CommentTransformer],
  exports: [PostTransformer, PostLikeTransformer, CommentTransformer]
})
export class PostModule { }
