import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager, } from 'typeorm';

import { PostEntity } from './entities/post.entity';
import { FollowerService } from '../follower/follower.service';
import { PaginationDto, PaginationEntity, SocketPostEvents, getNotificationMessage, getPostRoom } from '../../shared';

import { PostLikeEntity } from './entities/post-like.entity';
import { CommentEntity } from './entities/comment.entity';
import { CommentLikeEntity } from './entities/comment-like.entity';

import { PostIdDto, CreateCommentDto, CreatePostDto, CommentIdDto, BaseCommentDto, } from './dtos/';
import { SavedPostEntity } from './entities/saved-post.entity';
import { UpdatePostDto } from './dtos/update-post.dto';
import { PostMediaEntity } from './entities/post-media.entity';
import { UpdateCommentDto } from './dtos/update-comment.dto';
import { RedisEmitterService } from '../../shared/modules/redis-emitter/redis-emitter.service';
import { UserService } from '../user/user.service';
import { PostTransformer } from './transformers/post.transformer';
import { BasePostDto } from './dtos/base-post.dto';
import { UserEntity } from '../user/entities/user.entity';
import { CommentTransformer } from './transformers/comment.transformer';
import { FileEntity } from '../file/file.entity';
import { NotificationService } from '../notification/notification.service';
import { NotificationType } from '../notification/entities/notification.entity';
import { PostFilterDto } from './dtos/post-filter.dto';

@Injectable()
export class PostService {
     constructor(
          @InjectEntityManager() private em: EntityManager,
          private followerService: FollowerService,
          private redisEmiterService: RedisEmitterService,
          private userService: UserService,
          private postTransformer: PostTransformer,
          private commentTransformer: CommentTransformer,
          private notificationService: NotificationService
     ) { }

     private logger = new Logger(PostService.name);

     async findById(id): Promise<PostEntity> {
          return this.em.findOneBy(PostEntity, { id })
     }

     /**
      * 
      * @param postCreatorUsername - username of post creator to find followers bt his username
      * @param postData - post data that will be sent to client
      */
     async notifyFollowers(postCreatorUsername: string, newPost: BasePostDto) {
          const followers = await this.followerService.getFollowers(postCreatorUsername)

          for (const follower of followers.data) {
               await this.redisEmiterService.emitToOne({
                    data: newPost,
                    event: SocketPostEvents.NEW_POST,
                    userId: follower.followerId
               })
          }
     }

     private async checkFileValidity(userId: string, fileId: string) {
          const file = await this.em.findOne(FileEntity, { where: { id: fileId, creatorId: userId } });
          if (!file)
               throw new NotFoundException('File Not Found')

          return file
     }


     async create(data: CreatePostDto & { creatorId: string, creatorUsername: string }) {
          if (!data.caption && !data.medias?.length) {
               throw new BadRequestException("Both caption and files can't be empty")
          }

          if (data.medias?.length) {
               for (const m of data.medias) {
                    await this.checkFileValidity(data.creatorId, m.fileId)
               }
          }

          const post = await this.em.save(this.em.create(PostEntity, data))

          if (data.medias?.length) {
               const postMedias = await this.em.find(PostMediaEntity, { where: { postId: post.id }, relations: { file: true } });
               post.medias = postMedias
          }
          const postDto = this.postTransformer.entityToDto(post);
          postDto.creator = await this.userService.findUserById(data.creatorId);

          await this.notifyFollowers(data.creatorUsername, postDto)
          return postDto
     }

     async updatePost(postId: string, data: UpdatePostDto, updaterId: string): Promise<PostEntity> {
          const post = await this.em.findOne(PostEntity, { where: { id: postId, creatorId: updaterId }, relations: ['medias'] })
          if (!post) {
               throw new BadRequestException("Post Not Found")
          }

          // checks if there is update to medias and delete the old one if it doesn't exist in update dto 
          const oldMedias = post.medias;
          const newMedias = data.medias;
          let mediasToDelete: PostMediaEntity[] = []

          if (oldMedias?.length && newMedias?.length) {
               for (const media of oldMedias) {
                    if (!newMedias.find(m => m.fileId === media.fileId)) {
                         mediasToDelete.push(media)
                    }
               }
          }

          if (mediasToDelete.length) {
               for (const media of mediasToDelete) {
                    this.em.delete(PostMediaEntity, { id: media.id })
               }
          }

          return this.em.save(PostEntity, { id: postId, ...data })
     }

     async deletePost(postId: string, userId: string) {
          const post = await this.em.findOne(PostEntity, { where: { id: postId, creatorId: userId }, relations: ['medias'] })
          if (!post) {
               throw new BadRequestException("Post Not Found")
          }

          const runner = this.em.connection.createQueryRunner()
          await runner.connect()
          await runner.startTransaction()

          try {
               for (const media of post.medias) {
                    await runner.manager.delete(PostMediaEntity, { id: media.id })
               }
               await runner.manager.delete(PostEntity, { id: postId })
               this.logger.log('delete transaction commited')
               await runner.commitTransaction()
               return { deleted: true, postId }
          } catch (err) {
               this.logger.log(err)
               await runner.rollbackTransaction()
          } finally {
               await runner.release()
          }
     }

     // TODO - retrieve posts with comments like and replies
     async retrievePosts(fetchorId: string, filter: PostFilterDto) {
          const postQry = this.em.createQueryBuilder(PostEntity, 'p')
               .innerJoinAndSelect("p.creator", "creator")
               .leftJoinAndSelect("creator.avatar", 'avatar')
               .loadRelationCountAndMap('p.commentCount', 'p.comments')
               .loadRelationCountAndMap('p.likeCount', 'p.likes')
               .leftJoinAndSelect('p.medias', 'medias')
               .leftJoinAndSelect('medias.file', 'file')

          // find posts by creators username
          if (filter?.username) {
               postQry.andWhere('creator.username = :username', { username: filter.username })
          }

          else {
               postQry.leftJoinAndSelect("creator.followers", "followers")
                    .where("followers.followerId = :followerId", { followerId: fetchorId })
                    .orWhere("creator.id = :fetchorId", { fetchorId })
          }

          postQry.orderBy("p.createdAt", "DESC")
               .skip((filter.page - 1) * filter.limit)
               .limit(filter.limit)


          const [posts, total] = await postQry.getManyAndCount()
          for (const post of posts) {
               const isLiked = await this.em.findOne(PostLikeEntity, { where: { likerId: fetchorId, postId: post.id } });
               post.liked = !!isLiked
          }

          return new PaginationEntity({
               data: posts, total
          })
     }

     async retrieveMyPosts(myId: string, filter: PaginationDto) {
          const [posts, total] = await this.em.createQueryBuilder(PostEntity, 'p')
               .where("p.creatorId = :myId", { myId })
               .loadRelationCountAndMap('p.commentCount', 'p.comments')
               .loadRelationCountAndMap('p.likeCount', 'p.likes')
               .leftJoinAndSelect('p.medias', 'medias')
               .leftJoinAndSelect('medias.file', 'file')
               .orderBy("p.createdAt", "DESC")
               .skip((filter.page - 1) * filter.limit)
               .limit(filter.limit)
               .getManyAndCount();

          for (const post of posts) {
               const isLiked = await this.em.findOne(PostLikeEntity, { where: { likerId: myId, postId: post.id } });
               post.liked = !!isLiked
          }

          return new PaginationEntity({ data: posts, total })
     }

     /**
      * 
      * @param {PostIdDto} data - contains validated postId param
      * @param {string} likerId - user's Id who is liking the comment
      * @param {boolean} unlike - if unlike is true, it will unlike the post
      * @returns {PostLikeEntity} - returns PostLikeEntity
      */
     async likePost(data: PostIdDto, liker: UserEntity, unlike = false) {
          const post = await this.em.findOne(PostEntity, { where: { id: data.postId } })
          if (!post) throw new BadRequestException("Post Not Found")

          const alreadyLiked = await this.em.findOne(PostLikeEntity, { where: { postId: data.postId, likerId: liker.id } });

          if (!unlike && alreadyLiked)
               throw new BadRequestException('You already liked the post')
          else if (!unlike && !alreadyLiked) {
               const newLike = await this.em.save(this.em.create(PostLikeEntity, { likerId: liker.id, postId: data.postId }))

               // exception for user liking their own post
               if (post.creatorId !== liker.id) {
                    // emits socket event to all users in room
                    await this.redisEmiterService.emitToRoom({
                         data: newLike,
                         roomId: getPostRoom(newLike.postId),
                         event: SocketPostEvents.NEW_LIKE,
                    })

                    // sends realtime notification to commentor after user liking the comment
                    await this.notificationService.sendNotification({
                         action: `post/${data.postId}`,
                         message: getNotificationMessage({ type: NotificationType.Like, username: liker.username }),
                         receiverId: post.creatorId,
                         senderId: liker.id,
                         type: NotificationType.Like
                    })
               }
               return newLike
          }

          // If like entity doesn't exist with likerId, then the user didn't liked the post before
          if (unlike && !alreadyLiked)
               throw new BadRequestException("You didn't like the post")
          // user has already liked before so he can unlike
          else if (unlike && alreadyLiked) {
               await alreadyLiked.remove()
               return { unlike: true }
          }
     }

     /**
      * 
      * @param {CommentIdDto} data - contains commentId param
      * @param {string} likerId - user's Id who is liking the comment
      * @param {boolean} unlike - if unlike is true, it will unlike the comment
      * @returns  - returns CommentLikeEnriry
      */
     async likeComment(data: CommentIdDto, liker: UserEntity, unlike = false) {
          const comment = await this.em.findOne(CommentEntity, { where: { id: data.commentId } })
          if (!comment) throw new BadRequestException()

          const alreadyLiked = await this.em.findOne(CommentLikeEntity, { where: { commentId: data.commentId, likerId: liker.id } });

          if (!unlike && alreadyLiked)
               throw new BadRequestException('You already liked the post')
          else if (!unlike && !alreadyLiked) {
               const newLike = await this.em.save(this.em.create(CommentLikeEntity, { likerId: liker.id, commentId: data.commentId }))

               // sends realtime notification to commentor after user liking the comment
               // exception for user liking their own comment
               if (data.commentId !== liker.id) {
                    await this.notificationService.sendNotification({
                         action: `post/${comment.postId}`,
                         message: getNotificationMessage({ type: NotificationType.CommentLike, username: liker.username }),
                         receiverId: comment.commentorId,
                         senderId: liker.id,
                         type: NotificationType.CommentLike
                    })
               }
               return newLike
          }

          // If like entity doesn't exist with likerId, then the user didn't liked the post before
          if (unlike && !alreadyLiked)
               throw new BadRequestException("You have to like first inorder to unlike")
          // user has already liked before so he can unlike
          else if (unlike && alreadyLiked) {
               await alreadyLiked.remove()
               return { unlike: true }
          }
     }

     async retrievePostLikes(data: PostIdDto, filter: PaginationDto = { page: 1, limit: 15 }): Promise<PaginationEntity<PostLikeEntity>> {
          const post = await this.em.findOne(PostEntity, { where: { id: data.postId } })
          if (!post) throw new BadRequestException()

          const [likes, total] = await this.em.createQueryBuilder(PostLikeEntity, 'like')
               .where('like.postId = :postId', { postId: data.postId })
               .innerJoinAndSelect('like.liker', 'liker')
               .orderBy("like.createdAt", 'DESC')
               .skip((filter.page - 1) * filter.limit)
               .limit(filter.limit)
               .getManyAndCount();

          return new PaginationEntity({ data: likes, total })
     }

     async createComment(data: CreateCommentDto, user: UserEntity): Promise<BaseCommentDto> {
          let comment: CommentEntity;

          // there is postId so it is comment on post
          if (data.postId) {
               const post = await this.em.findOne(PostEntity, { where: { id: data.postId } });
               if (!post)
                    throw new NotFoundException("Post Not Found")

               comment = await this.em.save(this.em.create(CommentEntity, { postId: data.postId, text: data.text, commentorId: user.id }))


               // sends realtime notification to post creator saying that someone has commented on his/her post
               // exception for user commenting on their own post
               if (post.creatorId !== user.id) {
                    await this.notificationService.sendNotification({
                         action: `post/${data.postId}`,
                         message: getNotificationMessage({ type: NotificationType.Comment, username: user.username }),
                         receiverId: post.creatorId,
                         senderId: user.id,
                         type: NotificationType.Comment
                    })
               }
          }

          // there is parentCommentId so it is reply to comment
          else if (data.parentCommentId) {
               const parentComment = await this.em.findOneBy(CommentEntity, { id: data.parentCommentId });
               if (!parentComment)
                    throw new NotFoundException('Comment Not Found')

               comment = await this.em.save(this.em.create(CommentEntity, { parentCommentId: data.parentCommentId, text: data.text, commentorId: user.id }))

               // sends realtime notification to post creator saying that someone has replied to his/her comment
               // exception for user replying to their own comment
               if (parentComment.commentorId !== user.id) {
                    await this.notificationService.sendNotification({
                         action: `post/${parentComment.postId}`,
                         message: getNotificationMessage({ type: NotificationType.Reply, username: user.username }),
                         receiverId: parentComment.commentorId,
                         senderId: user.id,
                         type: NotificationType.Reply
                    })
               }
          }

          comment.commentor = user
          const commentDto = this.commentTransformer.entityToDto(comment);

          // emit event to client (both comment and reply)
          // if comment has parentId, then it is reply 
          // and if comment has postId, then it is comment on post
          this.redisEmiterService.emitToRoom({
               data: commentDto,
               event: SocketPostEvents.NEW_COMMENT,
               roomId: getPostRoom(data.postId),
          })

          return commentDto
     }

     async retrieveComments(data: PostIdDto, retrieverId: string, filter: PaginationDto = { page: 1, limit: 15 }): Promise<PaginationEntity<CommentEntity>> {
          const post = await this.em.findOne(PostEntity, { where: { id: data.postId } })
          if (!post) throw new BadRequestException()

          const [comments, total] = await this.em.createQueryBuilder(CommentEntity, 'comment')
               .where('comment.postId = :postId', { postId: data.postId })
               .innerJoinAndSelect('comment.commentor', 'commentor')
               .leftJoinAndSelect('commentor.avatar', 'avatar')
               .loadRelationCountAndMap('comment.likeCount', 'comment.likes')
               .loadRelationCountAndMap('comment.replyCount', 'comment.replies')
               .orderBy("comment.createdAt", 'DESC')
               .skip((filter.page - 1) * filter.limit)
               .limit(filter.limit)
               .getManyAndCount();

          for (const comment of comments) {
               const isLiked = await this.em.findOne(CommentLikeEntity, { where: { likerId: retrieverId, commentId: comment.id } });
               comment.liked = !!isLiked
          }

          return new PaginationEntity({ data: comments, total })
     }

     async retrieveCommentReplies(data: CommentIdDto, retrieverId: string, filter: PaginationDto = { page: 1, limit: 15 }): Promise<PaginationEntity<CommentEntity>> {
          const comment = await this.em.findOne(CommentEntity, { where: { id: data.commentId } })
          if (!comment) throw new BadRequestException('Comment Not Found')

          const [comments, total] = await this.em.createQueryBuilder(CommentEntity, 'comment')
               .where('comment.parentCommentId = :commentId', { commentId: data.commentId })
               .innerJoinAndSelect('comment.commentor', 'commentor')
               .leftJoinAndSelect('commentor.avatar', 'avatar')
               .loadRelationCountAndMap('comment.likeCount', 'comment.likes')
               .loadRelationCountAndMap('comment.replyCount', 'comment.replies')
               .orderBy('comment.createdAt', 'DESC')
               .skip((filter.page - 1) * filter.limit)
               .limit(filter.limit)
               .getManyAndCount();

          for (const comment of comments) {
               const isLiked = await this.em.findOne(CommentLikeEntity, { where: { likerId: retrieverId, commentId: comment.id } });
               comment.liked = !!isLiked
          }

          return new PaginationEntity({ data: comments, total })
     }

     /**
      * 
      * @param {PostIdDto} postIdDto - contains commentId param
      * @param {string} userId - user's Id who is liking the comment
      * @param {boolean} unsave - 
      * @returns  - returns CommentLikeEnriry
      */
     async savePost(postIdDto: PostIdDto, userId: string, unsave = false): Promise<SavedPostEntity | { unsaved: boolean }> {
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
               throw new BadRequestException("You didn't save the post")
          // user has already liked before so he can unsave now
          else if (unsave && alreadySaved) {
               await alreadySaved.remove()
               return { unsaved: true }
          }

          return this.em.save(this.em.create(SavedPostEntity, { userId, ...postIdDto }))
     }

     async updateComment(commentId: string, data: UpdateCommentDto, userId: string) {
          const comment = await this.em.findOneBy(CommentEntity, { id: commentId, commentorId: userId });
          if (!comment) {
               throw new NotFoundException("Comment Not Found")
          }

          return this.em.save(CommentEntity, { ...comment, text: data.text })
     }

     async deleteComment(commentId: string, userId: string) {
          const comment = await this.em.findOneBy(CommentEntity, { id: commentId, commentorId: userId });
          if (!comment) {
               throw new NotFoundException("Comment Not Found")
          }

          await comment.remove()
          return { deleted: true, commentId: comment.id }
     }
}
