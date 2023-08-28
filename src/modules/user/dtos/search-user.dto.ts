import { IsString } from "class-validator";

export class SearchUserDto {
     @IsString()
     keyword: string
}