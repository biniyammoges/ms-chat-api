import { Module } from '@nestjs/common';
import { StoryService } from './story.service';
import { StoryController } from './story.controller';
import { NotificationModule } from '../notification/notification.module';
import { RedisEmitterModule } from '../../shared/modules/redis-emitter/redis-emitter.module';
import { StoryTransformer } from './story.transformer';
import { FollowerModule } from '../follower/follower.module';
import { ChatModule } from '../chat/chat.module';
import { UserModule } from '../user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoryMediaEntity } from './entities/story-media.entity';
import { StoryEntity } from './entities/story.entity';
import { StoryMessageEntity } from './entities/story-message.entity';
import { StoryViewerEntity } from './entities/story-viewer.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([StoryEntity, StoryMediaEntity, StoryMessageEntity, StoryViewerEntity]),
    NotificationModule,
    RedisEmitterModule,
    FollowerModule,
    ChatModule,
    UserModule],
  controllers: [StoryController],
  providers: [StoryService, StoryTransformer],
  exports: [StoryTransformer]
})
export class StoryModule { }
