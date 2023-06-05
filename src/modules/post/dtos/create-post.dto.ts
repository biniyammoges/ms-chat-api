import { Type } from "class-transformer";
import { IsArray, IsOptional, IsString, IsUUID, ValidateNested } from "class-validator";

export class CreatePostMediaDto {
     @IsUUID()
     fileId: string

     @IsOptional()
     @IsUUID()
     postId?: string
}

export class CreatePostDto {
     @IsOptional()
     @IsString()
     caption?: string

     @IsOptional()
     @ValidateNested({ each: true })
     @IsArray()
     @Type(() => CreatePostMediaDto)
     medias?: CreatePostMediaDto[]
}

