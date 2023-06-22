import { IsUUID } from "class-validator";

export class StoryIdDto {
     @IsUUID()
     storyId: string
}