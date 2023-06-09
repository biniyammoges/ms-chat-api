import { Injectable } from "@nestjs/common";
import { PostEntity } from "../entities/post.entity";
import { BasePostDto } from "../dtos/base-post.dto";
import { UserTransformer } from "../../user/transformer/user.transformer";

@Injectable()
export class PostTransformer {
     constructor(private userTransformer: UserTransformer) { }

     entityToDto(entity: PostEntity, opts?: Record<string, never>) {
          const result: BasePostDto = {
               id: entity.id,
               creatorId: entity.creatorId,
               ...(entity.caption && { caption: entity.caption }),
               ...(entity.creator && { creator: this.userTransformer.entityToDto(entity.creator) }),
               createdAt: entity.createdAt,
               updatedAt: entity.updatedAt,
               medias: entity.medias?.length ? entity.medias.map(media => ({
                    ...media,
                    ...(media.file && {
                         file: {
                              ...media.file,
                              ...(media.file.creator && {
                                   creator: this.userTransformer.entityToDto(media.file?.creator)
                              })
                         }
                    })
               })) : [],
               likeCount: entity.likeCount || 0,
               commentCount: entity.commentCount || 0
          }

          return result
     }
}