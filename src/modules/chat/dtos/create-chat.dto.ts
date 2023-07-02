import { IsOptional, IsString, IsUUID } from "class-validator";

export class CreateChatDto {
     @IsUUID()
     @IsOptional()
     chatRoomId: string

     @IsUUID()
     reciepenId: string

     @IsString()
     message: string

     @IsOptional()
     @IsUUID()
     parentChatId?: string
}