import { UserEntity } from "../../user/entities/user.entity";
import { AbstractEntity } from "../../../shared";
import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { PostEntity } from "./post.entity";

@Entity()
@Index(['userId', 'postId'], { unique: true })
export class SavedPostEntity extends AbstractEntity {
     @Column('uuid')
     userId: string

     @ManyToOne(() => UserEntity, { onDelete: "CASCADE", onUpdate: 'CASCADE' })
     @JoinColumn({ name: "userId" })
     user?: UserEntity

     @Column('uuid')
     postId: string

     @ManyToOne(() => PostEntity, { onDelete: "CASCADE", onUpdate: 'CASCADE' })
     @JoinColumn({ name: "postId" })
     post?: PostEntity
}