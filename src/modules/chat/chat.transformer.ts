import { Injectable } from "@nestjs/common"
import { UserTransformer } from "../user/transformer/user.transformer"
import { ChatRoomEntity } from "./entities/chat-room.entity"
import { BaseChatRoomDto } from "./dtos/base-chat-room.dto"

@Injectable()
export class ChatTransformer {
     constructor(private userTransformer: UserTransformer) { }

     entityToDto(entity: ChatRoomEntity, opts?: Record<string, never>) {
          const result: BaseChatRoomDto = {
               ...entity,
               ...(entity?.chatUsers?.length && {
                    chatUsers: entity.chatUsers.map(cu => ({
                         ...cu,
                         ...(cu.user && ({ user: this.userTransformer.entityToDto(cu.user) }))
                    })),
               }),
               ...(entity.chats?.length && {
                    chats: entity.chats.map(c => ({
                         ...c,
                         sender: this.userTransformer.entityToDto(c.sender)
                    })),
               }),
          }

          return result
     }
}