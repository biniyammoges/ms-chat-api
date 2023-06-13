import { IsUUID } from "class-validator";

export class ChatRoomIdDto {
     @IsUUID()
     chatRoomId: string
}