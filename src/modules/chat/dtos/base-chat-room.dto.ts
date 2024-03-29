import { UserDto } from "src/modules/user/dtos/user.dto";
import { BaseDto } from "../../../shared";
import { ChatRoomType } from "../entities/chat-room.entity";

export class BaseChatRoomDto extends BaseDto {
     type: ChatRoomType;
     chats?: BaseChatDto[];
     chatUsers?: BaseChatUserDto[];
     unreadCount?: number;
}

export class BaseChatDto extends BaseDto {
     senderId: string;
     sender?: UserDto;
     chatRoomId: string;
     chatRoom?: BaseChatRoomDto;
     parentChatId?: string;
     parentChat?: BaseChatDto
}

export class BaseChatUserDto extends BaseDto {
     userId: string;
     user?: UserDto;
     chatRoomId: string;
     chatRoom?: BaseChatRoomDto;
}