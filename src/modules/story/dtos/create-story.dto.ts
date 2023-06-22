import { Type } from "class-transformer";
import { IsArray, ValidateNested } from "class-validator";

export class CreateStoryMediaDto {
     storyId?: string;
     fileId: string;
}

export class CreateStoryDto {
     @ValidateNested({ each: true })
     @IsArray()
     @Type(() => CreateStoryMediaDto)
     medias: CreateStoryMediaDto[]
}

