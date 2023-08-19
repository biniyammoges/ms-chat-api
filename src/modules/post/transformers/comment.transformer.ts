import { Injectable } from "@nestjs/common";
import { UserTransformer } from "../../user/transformer/user.transformer";
import { BaseCommentDto, } from "../dtos";
import { CommentEntity } from "../entities/comment.entity";

@Injectable()
export class CommentTransformer {
     constructor(private userTransformer: UserTransformer) { }

     entityToDto(entity: CommentEntity, opts?: Record<string, never>) {

          const result: BaseCommentDto = {
               ...entity,
               ...(entity.commentor && { commentor: this.userTransformer.entityToDto(entity.commentor) }),
               likeCount: entity.likeCount || 0,
               replyCount: entity.replyCount || 0,
               liked: entity.liked ?? false
          }

          return result
     }
}