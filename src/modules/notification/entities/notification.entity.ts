import { AbstractEntity } from "../../../shared";
import { Column, Entity, JoinColumn, OneToOne } from "typeorm";
import { UserEntity } from "src/modules/user/entities/user.entity";

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

     @Column()
     isRead: boolean

     @Column()
     receiverId: string

     @OneToOne(() => UserEntity, { onDelete: 'CASCADE' })
     @JoinColumn({ name: 'receiverId' })
     receiver?: UserEntity

     @Column()
     senderId: string

     @OneToOne(() => UserEntity, { onDelete: 'CASCADE' })
     @JoinColumn({ name: 'senderId' })
     sender?: UserEntity
}