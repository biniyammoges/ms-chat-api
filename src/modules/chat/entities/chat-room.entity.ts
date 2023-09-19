import { AbstractEntity } from "../../../shared";
import { Column, Entity, OneToMany } from "typeorm";
import { ChatEntity } from "./chat.entity";
import { ChatUserEntity } from "./chat-user.entity";
import { VirtualColumn } from "../../../decorators/virtual-column.decorator";

export enum ChatRoomType {
     Private = 'private',
     Group = 'group'
}

@Entity()
export class ChatRoomEntity extends AbstractEntity {
     @Column('enum', { enum: ChatRoomType, default: ChatRoomType.Private })
     type: ChatRoomType

     @OneToMany(() => ChatEntity, ce => ce.chatRoom)
     chats: ChatEntity[]

     @OneToMany(() => ChatUserEntity, ce => ce.chatRoom, { cascade: true })
     chatUsers: ChatUserEntity[]

     @VirtualColumn()
     unreadCount: number
}