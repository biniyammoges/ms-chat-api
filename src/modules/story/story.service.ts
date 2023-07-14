import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager, } from 'typeorm';
import { CreateStoryDto } from './dtos/create-story.dto';
import { UserEntity } from '../user/entities/user.entity';
import { StoryEntity } from './entities/story.entity';
import { ChatSocketEvents, PaginationDto, getNotificationMessage } from '../../shared';
import { CreateStoryMessageDto } from './dtos/create-story-message.dto';
import { ChatService } from '../chat/chat.service';
import { RedisEmitterService } from '../../shared/modules/redis-emitter/redis-emitter.service';
import { ChatEntity } from '../chat/entities/chat.entity';
import { addDays } from 'date-fns';
import { FollowerService } from '../follower/follower.service';
import { NotificationService } from '../notification/notification.service';
import { NotificationType } from '../notification/entities/notification.entity';
import { StoryViewerEntity } from './entities/story-viewer.entity';

@Injectable()
export class StoryService {
     constructor(
          @InjectEntityManager() private em: EntityManager,
          private chatService: ChatService,
          private redisEmitterService: RedisEmitterService,
          private followerService: FollowerService,
          private notificationService: NotificationService
     ) { }

     async createStory(data: CreateStoryDto, creator: UserEntity) {
          const story = await this.em.create(StoryEntity, { ...data, creatorId: creator.id, expire: addDays(new Date(), 1) })
          const { data: followers } = await this.followerService.getFollowers(creator.username)

          // notify followers when users uploads to story
          for (const f of followers) {
               await this.notificationService.sendNotification({
                    action: `story/${story.id}`,
                    message: getNotificationMessage({ type: NotificationType.AddedStory, username: creator.username }),
                    receiverId: f.followerId,
                    senderId: creator.id,
                    type: NotificationType.AddedStory
               })
          }

          // TODO - archive story entity automatically after 24 hours
          return this.em.save(story);
     }

     async retrieveStory(storyId: string, retriever: UserEntity) {
          const qry = this.em.createQueryBuilder(StoryEntity, 's')
               .where('s.id = :storyId', { storyId })
               .innerJoinAndSelect('s.creator', 'creator')
               .leftJoinAndSelect('creator.avatar', 'avatar')
               .leftJoinAndSelect('s.medias', 'medias')

          const story = await qry.getOne()
          if (!story) {
               throw new NotFoundException('Story Not Found')
          }

          if (story.creatorId === retriever.id) {
               story.viewers = await this.em.find(StoryViewerEntity, { where: { storyId }, relations: ['viewer'] })
          }
          else {
               const alreadyViewed = await this.em.findOne(StoryViewerEntity, { where: { storyId: storyId, viewerId: retriever.id } });

               if (!alreadyViewed) {
                    await this.em.save(this.em.create(StoryViewerEntity, { viewerId: retriever.id }))
               }
          }

          return story
     }

     async retrieveStories(retriever: UserEntity, filter: PaginationDto) {
          return this.em.createQueryBuilder(StoryEntity, 's')
               .where('s.isArchived = :isArchived', { isArchived: false, })
               .innerJoinAndSelect('s.creator', 'creator')
               .leftJoinAndSelect('creator.avatar', 'avatar')
               .innerJoin('creator.followers', 'followers')
               .where('followers.followerId = :retieverId', { retrieverId: retriever.id })
               .orWhere('s.creatorId = :creatorId', { creatorId: retriever.id })
               .leftJoinAndSelect('s.viewers', 'viewers')
               .leftJoinAndSelect('s.medias', 'medias')
               .orderBy('s.createdAt', 'DESC')
               .skip((filter.page - 1) * filter.limit)
               .limit(filter.limit)
               .getManyAndCount();
     }

     async retrieveMyArchived(retriever: UserEntity, filter: PaginationDto) {
          return this.em.createQueryBuilder(StoryEntity, 's')
               .where('s.isArchived = :isArchived', { isArchived: true })
               .andWhere('s.creatorId = :creatorId', { creatorId: retriever.id })
               .innerJoinAndSelect('s.creator', 'creator')
               .leftJoinAndSelect('creator.avatar', 'avatar')
               .leftJoinAndSelect('s.medias', 'medias')
               .orderBy('s.createdAt', 'DESC')
               .skip((filter.page - 1) * filter.limit)
               .limit(filter.limit)
               .getManyAndCount();
     }

     async createStoryMessage(storyId: string, sender: UserEntity, data: CreateStoryMessageDto) {
          const story = await this.em.findOne(StoryEntity, { where: { isArchived: false, id: storyId, } });
          if (!story) {
               throw new NotFoundException('Story Not Found')
          }

          const chatRoom = await this.chatService.findOrCreateChatRoom({ recipientId: story.creatorId }, sender.id)
          const message = await this.em.save(this.em.create(ChatEntity, {
               ...data,
               chatRoomId: chatRoom.id,
               senderId: sender.id,
               storyMessage: { storyId }
          }));

          // emit new message event to story owner
          await this.redisEmitterService.emitToOne({ data: message, event: ChatSocketEvents.NewMessage, userId: story.creatorId })
          return message
     }
}
