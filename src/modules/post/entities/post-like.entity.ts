import { UserEntity } from "../../user/entities/user.entity";
import { AbstractEntity } from "../../../shared";
import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { PostEntity } from "./post.entity";

@Entity()
@Index(['likerId', 'postId'], { unique: true })
export class PostLikeEntity extends AbstractEntity {
     @Column()
     likerId: string

     @ManyToOne(() => UserEntity)
     @JoinColumn({ name: "likerId" })
     liker?: UserEntity

     @Column()
     postId: string

     @ManyToOne(() => PostEntity)
     @JoinColumn({ name: "postId" })
     post?: PostEntity
}