import { Type } from "class-transformer";
import { IsArray, IsOptional, IsUUID, ValidateNested } from "class-validator";

export class CreatePostMediaDto {
     @IsUUID()
     fileId: string

     @IsOptional()
     @IsUUID()
     postId?: string
}

export class CreatePostDto {
     @IsOptional()
     caption?: string

     @ValidateNested({ each: true })
     @IsArray()
     @Type(() => CreatePostMediaDto)
     medias: CreatePostMediaDto[]
}

