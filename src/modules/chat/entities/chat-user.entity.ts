import { UserEntity } from "src/modules/user/entities/user.entity";
import { AbstractEntity } from "../../../shared";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { ChatRoomEntity } from "./chat-room.entity";

@Entity()
export class ChatUserEntity extends AbstractEntity {
     @Column('uuid')
     userId: string;

     @ManyToOne(() => UserEntity, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
     @JoinColumn({ name: "userId" })
     user: UserEntity

     @Column('uuid')
     chatRoomId: string;

     @ManyToOne(() => ChatRoomEntity, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
     @JoinColumn({ name: "chatRoomId" })
     chatRoom: ChatRoomEntity
}