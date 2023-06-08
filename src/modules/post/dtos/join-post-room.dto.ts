import { IsUUID } from "class-validator";

export class JoinPostRoomDto {
     @IsUUID()
     postId: string
}