import { BasePostMediaDto } from "../../post/dtos/base-post.dto";
import { UserDto } from "../../user/dtos/user.dto";
import { BaseDto } from "../../../shared";

export class BaseFileDto extends BaseDto {
     name?: string
     size?: number
     type: string
     path: string
     url: string
     privateUrl?: string
     creatorId?: string
     creator?: UserDto
     postMedia?: BasePostMediaDto
}