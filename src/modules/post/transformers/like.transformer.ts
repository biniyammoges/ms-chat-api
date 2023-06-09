import { Injectable } from "@nestjs/common";
import { UserTransformer } from "../../user/transformer/user.transformer";
import { PostLikeEntity } from "../entities/post-like.entity";
import { BasePostLikeDto } from "../dtos";

@Injectable()
export class PostLikeTransformer {
     constructor(private userTransformer: UserTransformer) { }

     entityToDto(entity: PostLikeEntity, opts?: Record<string, never>) {
          const result: BasePostLikeDto = {
               ...entity,
               ...(entity.liker && { liker: this.userTransformer.entityToDto(entity.liker) })
          }

          return result
     }
}