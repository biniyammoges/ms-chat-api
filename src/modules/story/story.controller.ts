import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { StoryService } from './story.service';
import { NotificationService } from '../notification/notification.service';
import { JwtAuthGuard } from '../auth/guards/at.guard';
import { GetUser, PaginationEntity, getNotificationMessage } from '../../shared';
import { UserEntity } from '../user/entities/user.entity';
import { CreateStoryDto } from './dtos/create-story.dto';
import { FollowerService } from '../follower/follower.service';
import { NotificationType } from '../notification/entities/notification.entity';
import { StoryEntity } from './entities/story.entity';
import { StoryTransformer } from './story.transformer';
import { BaseStoryDto } from './dtos/base-story.dto';
import { CreateStoryMessageDto } from './dtos/create-story-message.dto';
import { StoryIdDto } from './dtos/story-id.dto';
import { ChatEntity } from '../chat/entities/chat.entity';

@Controller('story')
@UseGuards(JwtAuthGuard)
export class StoryController {
  constructor(
    private readonly storyService: StoryService,
    private notificationService: NotificationService,
    private followerService: FollowerService,
    private storyTransformer: StoryTransformer,
  ) { }

  @Post('create')
  async createStory(@GetUser() creator: UserEntity, @Body() data: CreateStoryDto): Promise<StoryEntity> {
    const story = await this.storyService.createStory(data, creator);
    const followers = await this.followerService.getFollowers(creator.username);

    // notifiy followers
    for (const follower of followers?.data) {
      await this.notificationService.sendNotification({
        action: `story/${story.id}`,
        message: getNotificationMessage({ type: NotificationType.AddedStory, username: creator.username }),
        receiverId: follower.followerId,
        senderId: creator.id,
        type: NotificationType.AddedStory
      })
    }

    return story
  }

  @Get('retrieve')
  async retrieveStories(@GetUser() retriever: UserEntity, @Query('limit') limit: number = 20, @Query('page') page: number = 1): Promise<PaginationEntity<BaseStoryDto>> {
    const [stories, total] = await this.storyService.retrieveStories(retriever, { limit, page })
    return new PaginationEntity({ data: stories.map(s => this.storyTransformer.entityToDto(s)), total })
  }

  @Get('retrieve/:storyId')
  async retrieveStory(@GetUser() retriever: UserEntity, @Param() storyIdDto: StoryIdDto) {
    const story = await this.storyService.retrieveStory(storyIdDto.storyId, retriever);
    return this.storyTransformer.entityToDto(story)
  }

  @Get('retrieve-my-archived')
  async retrieveMyArchivedStories(@GetUser() retriever: UserEntity, @Query('limit') limit: number = 20, @Query('page') page: number = 1): Promise<PaginationEntity<BaseStoryDto>> {
    const [stories, total] = await this.storyService.retrieveMyArchived(retriever, { limit, page })
    return new PaginationEntity({ data: stories.map(s => this.storyTransformer.entityToDto(s)), total })
  }

  @Post('/:storyId/send-message')
  async createStoryMessage(@GetUser() sender: UserEntity, @Body() data: CreateStoryMessageDto, @Param() storyIdDto: StoryIdDto): Promise<ChatEntity> {
    return this.storyService.createStoryMessage(storyIdDto.storyId, sender, data)
  }
}
