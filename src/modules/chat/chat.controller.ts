import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/at.guard';
import { GetUser, PaginationEntity } from 'src/shared';
import { UserEntity } from '../user/entities/user.entity';
import { ChatTransformer } from './chat.transformer';
import { BaseChatRoomDto } from './dtos/base-chat-room.dto';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService, private chatTransformer: ChatTransformer) { }

  @Get('room/retrieve')
  async retrieveRooms(@GetUser() user: UserEntity, @Query('limit') limit: number = 20, @Query('page') page: number = 1): Promise<PaginationEntity<BaseChatRoomDto>> {
    const [rooms, total] = await this.chatService.retrieveChatRooms(user.id, { limit, page })
    return new PaginationEntity({ total, data: rooms.map(r => this.chatTransformer.entityToDto(r)) })
  }
}
