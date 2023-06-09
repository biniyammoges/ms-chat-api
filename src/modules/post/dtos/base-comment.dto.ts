import { BaseDto } from "../../../shared"
import { BaseCommentLikeDto } from "./base-like.dto";
import { BasePostDto } from "./base-post.dto";
import { UserDto } from "../../user/dtos/user.dto";

export class BaseCommentDto extends BaseDto {
     parentCommentId: string;
     parentComment?: BaseCommentDto
     replies?: BaseCommentDto[]
     commentorId: string
     commentor?: UserDto
     text: string
     postId: string
     post?: BasePostDto
     likes: BaseCommentLikeDto[]
     likeCount?: number
     replyCount?: number
}