import { FollowerEntity } from "../../follower/entities/follower.entity";
import { AbstractEntity } from "../../../shared/base.entity";
import { Column, Entity, OneToMany } from "typeorm";
import { PostEntity } from "../../post/entities/post.entity";
import { SavedPostEntity } from "../../post/entities/saved-post.entity";

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

     @Column({ nullable: true })
     refreshToken?: string;

     @Column({ nullable: true })
     fcmToken?: string;

     @OneToMany((type) => FollowerEntity, follow => follow.followee, { onDelete: 'CASCADE' })
     followers?: FollowerEntity[]

     @OneToMany((type) => FollowerEntity, follow => follow.follower, { onDelete: 'CASCADE' })
     followings?: FollowerEntity[]

     @OneToMany((type) => PostEntity, post => post.creator, { onDelete: "CASCADE" })
     posts: PostEntity[]

     @OneToMany(() => SavedPostEntity, sp => sp.user, { onDelete: "CASCADE" })
     savedPosts: SavedPostEntity[]

     followerCount?: number
     followingCount?: number
}