import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { CreateStoryDto } from './dtos/create-story.dto';
import { UserEntity } from '../user/entities/user.entity';
import { StoryEntity } from './entities/story.entity';
import { ChatSocketEvents, PaginationDto } from 'src/shared';
import { CreateStoryMessageDto } from './dtos/create-story-message.dto';
import { ChatService } from '../chat/chat.service';
import { RedisEmitterService } from 'src/shared/modules/redis-emitter/redis-emitter.service';

@Injectable()
export class StoryService {
     constructor(
          @InjectEntityManager() private em: EntityManager,
          private chatService: ChatService,
          private redisEmitterService: RedisEmitterService
     ) { }

     async createStory(data: CreateStoryDto, creator: UserEntity) {
          const story = await this.em.create(StoryEntity, { ...data, creatorId: creator.id, })

          // TODO - archive story entity automatically after 24 hours
          return this.em.save(story);
     }

     async retrieveStories(retriever: UserEntity, filter: PaginationDto) {
          return this.em.createQueryBuilder(StoryEntity, 's')
               .where('s.isArchived = :isArchived', { isArchived: false })
               .innerJoinAndSelect('s.creator', 'creator')
               .leftJoinAndSelect('creator.avatar', 'avatar')
               .innerJoin('creator.followers', 'followers')
               .where('followers.followerId = :retieverId', { retrieverId: retriever.id })
               .orWhere('s.creatorId = :creatorId', { creatorId: retriever.id })
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
          const story = await this.em.findOne(StoryEntity, { where: { isArchived: false, id: storyId } });
          if (!story) {
               throw new NotFoundException('Story Not Found')
          }

          const message = await this.chatService.createStoryMessage(data,
               { recipientId: story.creatorId, senderId: sender.id, storyId });

          // emit new message event to story owner
          await this.redisEmitterService.emitToOne({ data: message, event: ChatSocketEvents.NewMessage, userId: story.creatorId })
          return message
     }
}
