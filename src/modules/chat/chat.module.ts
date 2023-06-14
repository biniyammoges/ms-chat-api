import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatRoomEntity } from './entities/chat-room.entity';
import { ChatEntity } from './entities/chat.entity';
import { ChatUserEntity } from './entities/chat-user.entity';
import { RedisEmitterModule } from '../../shared/modules/redis-emitter/redis-emitter.module';
import { UserModule } from '../user/user.module';
import { NotificationModule } from '../notification/notification.module';
import { ChatTransformer } from './chat.transformer';
import { ChatGateway, } from './chat.gateway';
import { SocketStateModule } from '../../shared/modules/socket-state/socket-state.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatRoomEntity, ChatEntity, ChatUserEntity]),
    RedisEmitterModule,
    UserModule,
    NotificationModule,
    SocketStateModule],
  controllers: [ChatController],
  providers: [ChatService, ChatTransformer, ChatGateway,]
})
export class ChatModule { }
