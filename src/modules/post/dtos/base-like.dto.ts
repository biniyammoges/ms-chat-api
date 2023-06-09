import { BaseDto } from "../../../shared";
import { BasePostDto } from "./base-post.dto";
import { UserDto } from "../../user/dtos/user.dto";
import { BaseCommentDto } from "./base-comment.dto";

export class BasePostLikeDto extends BaseDto {
     likerId: string
     liker?: UserDto
     postId: string
     post?: BasePostDto
}

export class BaseCommentLikeDto extends BaseDto {
     likerId: string
     liker?: UserDto
     commentId: string
     comment?: BaseCommentDto
}