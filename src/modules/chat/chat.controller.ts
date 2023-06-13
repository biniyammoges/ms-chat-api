import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/at.guard';
import { GetUser, PaginationEntity } from '../../shared';
import { UserEntity } from '../user/entities/user.entity';
import { ChatTransformer } from './chat.transformer';
import { BaseChatDto, BaseChatRoomDto } from './dtos/base-chat-room.dto';
import { UserTransformer } from '../user/transformer/user.transformer';
import { ChatRoomIdDto } from './dtos/chat-room-id.dto';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService, private chatTransformer: ChatTransformer, private userTransformer: UserTransformer) { }

  @Get('room/retrieve')
  async retrieveRooms(@GetUser() user: UserEntity, @Query('limit') limit: number = 20, @Query('page') page: number = 1): Promise<PaginationEntity<BaseChatRoomDto>> {
    const [rooms, total] = await this.chatService.retrieveChatRooms(user.id, { limit, page })
    return new PaginationEntity({ total, data: rooms.map(r => this.chatTransformer.entityToDto(r)) })
  }

  @Get('room/:chatRoomId/retrieve-chats')
  async retrieveChats(@Param() chatRoomIdDto: ChatRoomIdDto, @GetUser() user: UserEntity, @Query('limit') limit: number = 20, @Query('page') page: number = 1,): Promise<PaginationEntity<BaseChatDto>> {
    const [chats, total] = await this.chatService.retrieveChats(chatRoomIdDto.chatRoomId, user.id, { limit, page })

    return new PaginationEntity<BaseChatDto>({
      total, data: chats.map(c => ({
        ...c,
        ...(c.sender && { sender: this.userTransformer.entityToDto(c.sender) })
      }))
    })
  }
}
