import { IsUUID } from "class-validator";

export class CommentIdDto {
     @IsUUID()
     commentId: string
}