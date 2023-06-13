import { IsUUID } from "class-validator";

export class TypingDto {
     @IsUUID()
     chatRoomId: string
}