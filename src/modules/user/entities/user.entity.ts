import { FollowerEntity } from "../../follower/entities/follower.entity";
import { AbstractEntity } from "../../../shared/base.entity";
import { Column, Entity, JoinColumn, OneToMany, OneToOne } from "typeorm";
import { PostEntity } from "../../post/entities/post.entity";
import { SavedPostEntity } from "../../post/entities/saved-post.entity";
import { FileEntity } from "../../file/file.entity";
import { NotificationEntity } from "../../notification/entities/notification.entity";

@Entity()
export class UserEntity extends AbstractEntity {
     @Column()
     firstName: string;

     @Column()
     lastName: string;

     @Column({ unique: true })
     username: string;

     @Column({ nullable: true, unique: true })
     phone?: string;

     @Column({ unique: true, nullable: true })
     email?: string;

     @Column()
     password: string;

     @Column({ nullable: true })
     bio?: string;

     @Column({ nullable: true })
     location?: string;

     @Column({ nullable: true })
     website?: string;

     @Column({ nullable: true })
     birthDate?: Date;

     @Column('bool', { default: false })
     isOnline: boolean

     @Column('date', { nullable: true })
     lastSeen: Date

     @Column({ nullable: true })
     refreshToken?: string;

     @Column({ nullable: true })
     fcmToken?: string;

     @Column('uuid', { nullable: true })
     avatarId?: string;

     @OneToOne(() => FileEntity, { onDelete: 'SET NULL' })
     @JoinColumn({ name: 'avatarId' })
     avatar?: FileEntity

     @OneToMany((type) => FollowerEntity, follow => follow.followee,)
     followers?: FollowerEntity[]

     @OneToMany((type) => FollowerEntity, follow => follow.follower,)
     followings?: FollowerEntity[]

     @OneToMany((type) => PostEntity, post => post.creator,)
     posts: PostEntity[]

     @OneToMany(() => SavedPostEntity, sp => sp.user,)
     savedPosts: SavedPostEntity[]

     @OneToMany(() => NotificationEntity, ne => ne.receiver)
     notifications: NotificationEntity[]

     postCount?: number;
     followerCount?: number;
     followingCount?: number;
     savedPostCount?: number;
}