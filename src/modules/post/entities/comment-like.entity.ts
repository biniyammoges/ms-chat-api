import { UserEntity } from "../../user/entities/user.entity";
import { AbstractEntity } from "../../../shared";
import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { CommentEntity } from "./comment.entity";

@Entity()
@Index(['likerId', 'commentId'], { unique: true })
export class CommentLikeEntity extends AbstractEntity {
     @Column()
     likerId: string

     @ManyToOne(() => UserEntity, { onDelete: "CASCADE", onUpdate: 'CASCADE' })
     @JoinColumn({ name: "likerId" })
     liker?: UserEntity

     @Column()
     commentId: string

     @ManyToOne(() => CommentEntity, { onDelete: "CASCADE", onUpdate: 'CASCADE' })
     @JoinColumn({ name: "commentId" })
     comment?: CommentEntity
}