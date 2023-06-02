import { UserEntity } from "src/modules/user/entities/user.entity";
import { AbstractEntity } from "../../../shared";
import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { PostEntity } from "./post.entity";

@Entity()
@Index(['commentorId', 'postId'], { unique: true })
export class CommentEntity extends AbstractEntity {
     @Column()
     parentCommentId: string;

     @OneToMany(() => CommentEntity, cm => cm.replies, { onDelete: "CASCADE" })
     @JoinColumn({ name: "parentCommentId" })
     parentComment?: CommentEntity

     @ManyToOne(() => CommentEntity, cm => cm.parentCommentId)
     replies: CommentEntity[]

     @Column()
     commentorId: string

     @ManyToOne(() => UserEntity)
     @JoinColumn({ name: "commentorId" })
     commentor?: CommentEntity

     @Column()
     text: string

     @Column()
     postId: string

     @ManyToOne(() => PostEntity)
     @JoinColumn({ name: "postId" })
     post?: PostEntity

     likeCount?: number
     replyCount?: number
}