import { UserEntity } from "../../user/entities/user.entity";
import { AbstractEntity } from "../../../shared";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, } from "typeorm";
import { PostEntity } from "./post.entity";
import { CommentLikeEntity } from "./comment-like.entity";
import { VirtualColumn } from "../../../decorators/virtual-column.decorator";

@Entity()
export class CommentEntity extends AbstractEntity {
     @Column('uuid', { nullable: true })
     parentCommentId: string;

     @ManyToOne(() => CommentEntity, cm => cm.replies, { onDelete: "CASCADE" })
     @JoinColumn({ name: "parentCommentId" })
     parentComment?: CommentEntity

     @OneToMany(() => CommentEntity, cm => cm.parentComment)
     replies: CommentEntity[]

     @Column('uuid')
     commentorId: string

     @ManyToOne(() => UserEntity)
     @JoinColumn({ name: "commentorId" })
     commentor?: CommentEntity

     @Column()
     text: string

     @Column('uuid', { nullable: true })
     postId: string

     @ManyToOne(() => PostEntity)
     @JoinColumn({ name: "postId" })
     post?: PostEntity

     @OneToMany(() => CommentLikeEntity, cm => cm.comment, { onDelete: "CASCADE" })
     likes: CommentLikeEntity[]

     @VirtualColumn()
     likeCount?: number

     @VirtualColumn()
     replyCount?: number
}