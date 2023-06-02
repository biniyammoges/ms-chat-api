import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';

import { PostEntity } from './entities/post.entity';
import { FollowerService } from '../follower/follower.service';
import { PaginationDto, PaginationEntity } from '../../shared';

import { PostLikeEntity } from './entities/post-like.entity';
import { CommentEntity } from './entities/comment.entity';
import { CommentLikeEntity } from './entities/comment-like.entity';

import { PostIdDto, CreateCommentDto, CreatePostDto, CommentIdDto } from './dtos/';
import { SavedPostEntity } from './entities/saved-post.entity';
import { date } from 'joi';

@Injectable()
export class PostService {
     constructor(@InjectEntityManager() private em: EntityManager, private followerService: FollowerService) { }

     async create(data: CreatePostDto & { creatorId: string }) {
          const post = await this.em.save(this.em.create(PostEntity, data))

          const followers = await this.followerService.getFollowers(data.creatorId);
          // TODO - emit 'new-post' to all followers 

          return post
     }

     // TODO - retrieve posts with comments like and replies
     async retrievePosts(fetchorId: string, filter: PaginationDto = { page: 1, limit: 20 }) {
          const [posts, total] = await this.em.createQueryBuilder(PostEntity, 'p')
               .innerJoin("p.creator", "creator")
               .innerJoin("creator.followers", "followers")
               .where("followers.followerId = :fetchorId", { fetchorId })
               .orWhere("p.creatorId = :fetcherId", { fetchorId })
               .leftJoin("p.comments", "comments")
               .addSelect((subQuery) => {
                    return subQuery
                         .select("Count(comments.id)", "commentCount")
                         .from(CommentEntity.name, "comments")
                         .where("comments.postId = p.id")
               }, "commentCount")
               .leftJoin("p.likes", "likes")
               .addSelect((subQuery) => {
                    return subQuery
                         .select("Count(likes.id)", "likeCount")
                         .from(PostLikeEntity.name, "likes")
                         .where("likes.postId = p.id")
               }, "likeCount")
               .limit(filter.limit)
               .skip((filter.page - 1) * filter.limit)
               .orderBy("p.createdAt", "DESC")
               .getManyAndCount();

          return new PaginationEntity({ data: posts, total })
     }

     async retrieveMyPosts(myId: string, filter: PaginationDto = { page: 1, limit: 10 }) {
          const [posts, total] = await this.em.createQueryBuilder(PostEntity, 'p')
               .where("p.creatorId = :myId", { myId })
               .leftJoin("p.comments", "comments")
               .addSelect((subQuery) => {
                    return subQuery
                         .select("Count(comments.id)", "commentCount")
                         .from(CommentEntity.name, "comments")
                         .where("comments.postId = p.id")
               }, "commentCount")
               .leftJoin("p.likes", "likes")
               .addSelect((subQuery) => {
                    return subQuery
                         .select("Count(likes.id)", "likeCount")
                         .from(PostLikeEntity.name, "likes")
                         .where("likes.postId = p.id")
               }, "likeCount")
               .limit(filter.limit)
               .skip((filter.page - 1) * filter.limit)
               .orderBy("p.createdAt", "DESC")
               .getManyAndCount();

          return new PaginationEntity({ data: posts, total })
     }

     /**
      * 
      * @param {PostIdDto} data - contains validated postId param
      * @param {string} likerId - user's Id who is liking the comment
      * @param {boolean} unlike - if unlike is true, it will unlike the post
      * @returns {PostLikeEntity} - returns PostLikeEntity
      */
     async likePost(data: PostIdDto, likerId: string, unlike = false) {
          const post = await this.em.findOne(PostEntity, { where: { id: data.postId } })
          if (!post) throw new BadRequestException()

          const alreadyLiked = await this.em.findOne(PostLikeEntity, { where: { postId: data.postId, likerId } });

          if (!unlike && alreadyLiked)
               throw new BadRequestException('You already liked the post')
          else if (!unlike && !alreadyLiked) {
               // TODO - notify post creator when new post like is created
               return this.em.save(this.em.create(PostLikeEntity, { likerId, postId: data.postId }))
          }

          // If like entity doesn't exist with likerId, then the user didn't liked the post before
          if (unlike && !alreadyLiked)
               throw new BadRequestException("You have to like first inorder to unlike")
          // user has already liked before so he can unlike
          else if (unlike && alreadyLiked)
               return alreadyLiked.remove()
     }

     /**
      * 
      * @param {CommentIdDto} data - contains commentId param
      * @param {string} likerId - user's Id who is liking the comment
      * @param {boolean} unlike - if unlike is true, it will unlike the comment
      * @returns  - returns CommentLikeEnriry
      */
     async likeComment(data: CommentIdDto, likerId: string, unlike = false) {
          const comment = await this.em.findOne(CommentLikeEntity, { where: { id: data.commentId } })
          if (!comment) throw new BadRequestException()

          const alreadyLiked = await this.em.findOne(CommentLikeEntity, { where: { commentId: data.commentId, likerId } });

          if (!unlike && alreadyLiked)
               throw new BadRequestException('You already liked the post')
          else if (!unlike && !alreadyLiked) {
               // TODO - notify comment owner when new comment like created
               return this.em.save(this.em.create(CommentLikeEntity, { likerId, commentId: data.commentId }))
          }

          // If like entity doesn't exist with likerId, then the user didn't liked the post before
          if (unlike && !alreadyLiked)
               throw new BadRequestException("You have to like first inorder to unlike")
          // user has already liked before so he can unlike
          else if (unlike && alreadyLiked)
               return alreadyLiked.remove()
     }

     async retrievePostLikes(data: PostIdDto, filter: PaginationDto = { page: 1, limit: 15 }): Promise<PaginationEntity<PostLikeEntity>> {
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

     async createComment(data: CreateCommentDto, commentorId: string): Promise<CommentEntity> {
          let comment: CommentEntity;

          // there is postId so it is comment on post
          if (data.postId) {
               const post = await this.em.findOne(PostEntity, { where: { id: data.postId } });
               if (!post)
                    throw new NotFoundException("Post Not Found")

               comment = await this.em.create(CommentEntity, { postId: data.postId, text: data.text, commentorId })
               // TODO - notify post owner that someone has commented to their post
          }

          // there is parentCommentId so it is reply to comment
          else if (data.parentCommentId) {
               const parentComment = await this.em.findOneBy(CommentEntity, { id: data.parentCommentId });
               if (!parentComment)
                    throw new NotFoundException('Comment Not Found')

               comment = await this.em.create(CommentEntity, { parentCommentId: data.parentCommentId, text: data.text, commentorId })
               // TODO - notify comment owner that someone has replied to their comment
          }

          return this.em.save(comment)
     }

     async retrieveComments(data: PostIdDto, filter: PaginationDto = { page: 1, limit: 15 }): Promise<PaginationEntity<CommentEntity>> {
          const post = await this.em.findOne(PostEntity, { where: { id: data.postId } })
          if (!post) throw new BadRequestException()

          const [comments, total] = await this.em.createQueryBuilder(CommentEntity, 'comment')
               .where('comment.postId = :postId', { postId: data.postId })
               .innerJoinAndSelect('comment.commentor', 'commentor')
               .select(['commentor.id', 'commentor.firstName', 'comment.lastName'])
               .leftJoin("comment.likes", "likes")
               .addSelect(subQuery => {
                    return subQuery
                         .select("COUNT(likes.id)", "likeCount")
                         .from(CommentLikeEntity.name, "commentLikes")
                         .where("commentLikes.commentId = comment.id")
               }, "likeCount")
               .leftJoin("comment.replies", "replies")
               .addSelect(subQuery => {
                    return subQuery
                         .select("COUNT(replies.id)", "replyCount")
                         .from(CommentEntity.name, "commentReplies")
                         .where("commentReplies.parentCommentId = comment.id")
               }, "replyCount")
               .limit(filter.limit)
               .skip((filter.page - 1) * filter.limit)
               .getManyAndCount();

          return new PaginationEntity({ data: comments, total })
     }

     async retrieveCommentReplies(data: CommentIdDto, filter: PaginationDto = { page: 1, limit: 15 }): Promise<PaginationEntity<CommentEntity>> {
          const comment = await this.em.findOne(CommentEntity, { where: { parentCommentId: data.commentId } })
          if (!comment) throw new BadRequestException()

          const [comments, total] = await this.em.createQueryBuilder(CommentEntity, 'comment')
               .where('comment.parentCommentId = :commentId', { commentId: data.commentId })
               .innerJoinAndSelect('comment.commentor', 'commentor')
               .select(['commentor.id', 'commentor.firstName', 'comment.lastName'])
               .select(['commentor.id', 'commentor.firstName', 'comment.lastName'])
               .leftJoin("comment.likes", "likes")
               .addSelect(subQuery => {
                    return subQuery
                         .select("COUNT(likes.id)", "likeCount")
                         .from(CommentLikeEntity.name, "commentLikes")
                         .where("commentLikes.commentId = comment.id")
               }, "likeCount")
               .leftJoin("comment.replies", "replies")
               .addSelect(subQuery => {
                    return subQuery
                         .select("COUNT(replies.id)", "replyCount")
                         .from(CommentEntity.name, "commentReplies")
                         .where("commentReplies.parentCommentId = comment.id")
               }, "replyCount")
               .limit(filter.limit)
               .skip((filter.page - 1) * filter.limit)
               .getManyAndCount();

          return new PaginationEntity({ data: comments, total })
     }

     /**
      * 
      * @param {PostIdDto} postIdDto - contains commentId param
      * @param {string} userId - user's Id who is liking the comment
      * @param {boolean} unsave - 
      * @returns  - returns CommentLikeEnriry
      */
     async savePost(postIdDto: PostIdDto, userId: string, unsave = false): Promise<SavedPostEntity> {
          const post = await this.em.findOneBy(PostEntity, { id: postIdDto.postId });
          if (!post)
               throw new NotFoundException('Post Not Found')

          const alreadySaved = await this.em.findOne(SavedPostEntity, {
               where: { userId, postId: postIdDto.postId }
          });

          if (!unsave && alreadySaved)
               throw new BadRequestException('You already saved the post')
          // user didn't saved the post, so he can save now
          else if (!unsave && !alreadySaved) {
               return this.em.save(this.em.create(SavedPostEntity, { userId, ...postIdDto }))
          }

          if (unsave && !alreadySaved)
               throw new BadRequestException("You have to save first inorder to unsave")
          // user has already liked before so he can unsave now
          else if (unsave && alreadySaved)
               return alreadySaved.remove()

          return this.em.save(this.em.create(SavedPostEntity, { userId, ...postIdDto }))
     }
}
