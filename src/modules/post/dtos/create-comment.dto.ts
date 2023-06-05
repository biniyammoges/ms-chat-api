import { IsString, IsUUID, ValidateIf } from "class-validator";

// export class RetrieveCommentDto 

export class CreateCommentDto {
     @ValidateIf((dto: CreateCommentDto) => !dto.postId)
     @IsUUID()
     parentCommentId?: string;

     @IsString()
     text: string

     @ValidateIf((dto: CreateCommentDto) => !dto.parentCommentId)
     @IsUUID()
     postId?: string
}