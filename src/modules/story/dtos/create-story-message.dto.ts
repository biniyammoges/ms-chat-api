import { IsString } from "class-validator";

export class CreateStoryMessageDto {
     @IsString()
     message: string
}