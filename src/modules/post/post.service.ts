import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { CreatePostDto } from './dtos/create-post.dto';
import { PostEntity } from './entities/post.entity';
import { FollowerService } from '../follower/follower.service';
import { PaginationDto, PaginationEntity } from 'src/shared';
import { LikePostDto } from './dtos/like-post.dto';
import { PostLikeEntity } from './entities/post-like.entity';

@Injectable()
export class PostService {
     constructor(@InjectEntityManager() private em: EntityManager, private followerService: FollowerService) { }

     async create(data: CreatePostDto & { creatorId: string }) {
          const post = await this.em.create(PostEntity, data);

          const followers = await this.followerService.getFollowers(data.creatorId);
          // TODO - emit 'new-post' to all followers 

          return this.em.save(post);
     }

     // TODO - retrieve posts with comments like and replies
     async retrievePosts(fetchorId: string, filter: PaginationDto = { page: 1, limit: 20 }) {
          const [posts, total] = await this.em.createQueryBuilder(PostEntity, 'p')
               .innerJoin("p.creator", "creator")
               .innerJoin("creator.followers", "followers")
               .where("followers.followerId = :fetchorId", { fetchorId })
               .orWhere("p.creatorId = :fetcherId", { fetchorId })
               .limit(filter.limit)
               .skip((filter.page - 1) * filter.limit)
               .orderBy("p.createdAt", "DESC")
               .getManyAndCount();

          return new PaginationEntity({ data: posts, total })
     }

     async retrieveMyPosts(id: string, filter: PaginationDto = { page: 1, limit: 10 }) {
          const [posts, total] = await this.em.createQueryBuilder(PostEntity, 'p')
               .orWhere("p.creatorId = :id", { id })
               .limit(filter.limit)
               .skip((filter.page - 1) * filter.limit)
               .orderBy("p.createdAt", "DESC")
               .getManyAndCount();

          return new PaginationEntity({ data: posts, total })
     }

     async likePost(data: LikePostDto, likerId: string, unlike = false) {
          const post = await this.em.findOne(PostEntity, { where: { id: data.postId } })
          if (!post) throw new BadRequestException()

          const alreadyLiked = await this.em.findOne(PostLikeEntity, { where: { postId: data.postId, likerId } });

          if (!unlike && alreadyLiked)
               throw new BadRequestException('You already liked the post')
          else if (!unlike && !alreadyLiked)
               return this.em.save(this.em.create(PostLikeEntity, { likerId, postId: data.postId }))

          // If like entity doesn't exist with likerId, then the user didn't liked the post before
          if (unlike && !alreadyLiked)
               throw new BadRequestException("You have to like first inorder to unlike")
          // user has already liked before so he can unlike
          else if (unlike && alreadyLiked)
               return alreadyLiked.remove()
     }

     async retrievePostLikes(data: LikePostDto, filter: PaginationDto = { page: 1, limit: 15 }): Promise<PaginationEntity<PostLikeEntity>> {
          const post = await this.em.findOne(PostEntity, { where: { id: data.postId } })
          if (!post) throw new BadRequestException()

          const [likes, total] = await this.em.createQueryBuilder(PostLikeEntity, 'like')
               .where('like.postId = :postId', { postId: data.postId })
               .innerJoinAndSelect('like.liker', 'liker')
               .select(['liker.id', 'liker.firstName', 'like.lastName'])
               .limit(filter.limit)
               .skip((filter.page - 1) * filter.limit)
               .getManyAndCount();

          return new PaginationEntity({ data: likes, total })
     }
}
