import { Injectable } from "@nestjs/common"
import { UserTransformer } from "../user/transformer/user.transformer"
import { StoryEntity } from "./entities/story.entity"
import { BaseStoryDto } from "./dtos/base-story.dto"

@Injectable()
export class StoryTransformer {
     constructor(private userTransformer: UserTransformer) { }

     entityToDto(entity: StoryEntity, opts?: Record<string, never>) {
          const result: BaseStoryDto = {
               ...entity,
               ...(entity.creator && { sender: this.userTransformer.entityToDto(entity.creator) }),
               viewers: entity.viewers.length ?
                    entity.viewers.map(v => ({ ...v, viewer: this.userTransformer.entityToDto(v.viewer) })) : [],
               storyMessages: entity.storyMessages.length ? entity.storyMessages.map(s => ({
                    ...s,
                    ...(s.message && {
                         message: {
                              ...s.message, ...(s.message.sender && ({
                                   sender: this.userTransformer.entityToDto(s.message.sender)
                              }))
                         }
                    })
               })) : [],
          }

          return result
     }
}