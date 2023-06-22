import { UserEntity } from "../../user/entities/user.entity";
import { AbstractEntity } from "../../../shared";
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from "typeorm";
import { ChatRoomEntity } from "./chat-room.entity";
import { StoryMessageEntity } from "src/modules/story/entities/story-message.entity";

@Entity()
export class ChatEntity extends AbstractEntity {

     @Column('uuid', { nullable: true })
     parentChatId?: string

     @ManyToOne(() => ChatEntity, { onDelete: 'SET NULL', onUpdate: 'CASCADE' })
     @JoinColumn({ name: "parentChatId" })
     parentChat?: ChatEntity

     @Column()
     message: string;

     @Column('uuid', { nullable: true })
     senderId: string;

     @ManyToOne(() => UserEntity, { onDelete: 'SET NULL', onUpdate: 'CASCADE' })
     @JoinColumn({ name: "senderId" })
     sender: UserEntity

     @Column('uuid')
     chatRoomId: string;

     @ManyToOne(() => ChatRoomEntity, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
     @JoinColumn({ name: "chatRoomId" })
     chatRoom: ChatRoomEntity

     @Column('bool', { default: false })
     isSeen: boolean

     @OneToOne(() => StoryMessageEntity, sme => sme.message, { cascade: true })
     storyMessage?: StoryMessageEntity
}