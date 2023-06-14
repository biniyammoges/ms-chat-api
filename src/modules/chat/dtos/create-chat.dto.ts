import { IsOptional, IsString, IsUUID } from "class-validator";

export class CreateChatDto {
     @IsUUID()
     chatRoomId: string

     @IsString()
     message: string

     @IsOptional()
     @IsUUID()
     parentChatId?: string
}