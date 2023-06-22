import { UserDto } from "../../user/dtos/user.dto";
import { BaseDto } from "../../../shared";
import { BaseFileDto } from "../../file/dto/base-file.dto";
import { BaseChatDto } from "../../chat/dtos/base-chat-room.dto";

export class BaseStoryDto extends BaseDto {
     creatorId: string
     creator?: UserDto
     expire: Date
     isArchived: boolean;
     medias?: BaseStoryMediaDto[]
     viewers?: BaseStoryViewerDto[]
     storyMessages: BaseStoryMessageDto[]
}

export class BaseStoryMediaDto {
     storyId: string;
     story?: BaseStoryDto;
     fileId: string;
     file?: BaseFileDto;
}

export class BaseStoryViewerDto {
     storyId: string;
     story?: BaseStoryDto;
     viewerId: string;
     viewer?: UserDto;
}

export class BaseStoryMessageDto {
     storyId: string;
     story?: BaseStoryDto;
     messageId: string
     message?: BaseChatDto;
}