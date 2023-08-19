import { UserDto } from "../../user/dtos/user.dto";
import { BaseDto } from "../../../shared";
import { BaseFileDto } from "../../file/dto/base-file.dto";

export class BasePostDto extends BaseDto {
     creatorId: string;
     caption?: string;
     creator: UserDto
     medias?: BasePostMediaDto[]
     likeCount?: number
     commentCount?: number
     liked?: boolean
}

export class BasePostMediaDto extends BaseDto {
     fileId: string;
     file?: BaseFileDto
     postId: string;
     post?: BasePostDto
}