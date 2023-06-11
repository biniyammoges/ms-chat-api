import { UserEntity } from "../../user/entities/user.entity";
import { AbstractEntity } from "../../../shared";
import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { PostEntity } from "./post.entity";

@Entity()
@Index(['likerId', 'postId'], { unique: true })
export class PostLikeEntity extends AbstractEntity {
     @Column('uuid')
     likerId: string

     @ManyToOne(() => UserEntity, { onDelete: "CASCADE", onUpdate: 'CASCADE' })
     @JoinColumn({ name: "likerId" })
     liker?: UserEntity

     @Column('uuid')
     postId: string

     @ManyToOne(() => PostEntity, { onDelete: "CASCADE", onUpdate: 'CASCADE' })
     @JoinColumn({ name: "postId" })
     post?: PostEntity
}