import { UserEntity } from "src/modules/user/entities/user.entity";
import { AbstractEntity } from "../../../shared";
import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { CommentEntity } from "./comment.entity";

@Entity()
@Index(['likerId', 'commentId'], { unique: true })
export class CommentLikeEntity extends AbstractEntity {
     @Column()
     likerId: string

     @ManyToOne(() => UserEntity)
     @JoinColumn({ name: "likerId" })
     liker?: UserEntity

     @Column()
     commentId: string

     @ManyToOne(() => CommentEntity)
     @JoinColumn({ name: "commentId" })
     comment?: CommentEntity
}