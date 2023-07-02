import { Module } from '@nestjs/common';
import { StoryService } from './story.service';
import { StoryController } from './story.controller';
import { NotificationModule } from '../notification/notification.module';
import { RedisEmitterModule } from 'src/shared/modules/redis-emitter/redis-emitter.module';
import { StoryTransformer } from './story.transformer';
import { FollowerModule } from '../follower/follower.module';
import { ChatModule } from '../chat/chat.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [NotificationModule, RedisEmitterModule, FollowerModule, ChatModule, UserModule],
  controllers: [StoryController],
  providers: [StoryService, StoryTransformer],
  exports: [StoryTransformer]
})
export class StoryModule { }
