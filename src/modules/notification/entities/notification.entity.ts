import { AbstractEntity } from "../../../shared";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { UserEntity } from "../../user/entities/user.entity";

// Notifications
export enum NotificationType {
     Default = 'default',
     Reply = 'reply',
     Like = 'like',
     Comment = 'comment',
     CommentLike = 'comment-like',
     Message = 'message',
     Follow = 'follow'
}

@Entity()
export class NotificationEntity extends AbstractEntity {
     @Column({ type: 'enum', enum: NotificationType, default: NotificationType.Default })
     type: NotificationType

     @Column()
     message: string;

     @Column()
     action: string;

     @Column({ default: false })
     isRead: boolean

     @Column('uuid', { unique: false })
     receiverId: string

     @ManyToOne(() => UserEntity, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
     @JoinColumn({ name: 'receiverId' })
     receiver?: UserEntity

     @Column('uuid', { unique: false })
     senderId: string

     @ManyToOne(() => UserEntity, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
     @JoinColumn({ name: 'senderId' })
     sender?: UserEntity
}