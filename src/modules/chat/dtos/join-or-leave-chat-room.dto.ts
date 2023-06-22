import { Transform } from "class-transformer";
import { IsBoolean, IsOptional, IsUUID, } from "class-validator";

export class JoinChatRoomDto {
     @IsUUID()
     recipientId: string

     @IsOptional()
     @IsUUID()
     chatRoomId?: string

     @IsOptional()
     @IsBoolean()
     @Transform(({ value }) => value === 'true' ? true : false)
     isGroupChat?: boolean
}

export class LeaveChatRoomDto {
     @IsUUID()
     chatRoomId: string
}