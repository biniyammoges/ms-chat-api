import { IsOptional, IsString, IsUUID } from "class-validator";

export class CreateCommentDto {
     @IsOptional()
     @IsUUID()
     parentCommentId: string;

     @IsString()
     text: string

     @IsUUID()
     postId: string
}