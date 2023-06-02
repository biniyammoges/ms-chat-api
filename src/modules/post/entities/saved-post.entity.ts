import { UserEntity } from "src/modules/user/entities/user.entity";
import { AbstractEntity } from "src/shared";
import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { PostEntity } from "./post.entity";

@Entity()
@Index(['userId', 'postId'], { unique: true })
export class SavedPostEntity extends AbstractEntity {
     @Column()
     userId: string

     @ManyToOne(() => UserEntity)
     @JoinColumn({ name: "userId" })
     user?: UserEntity

     @Column()
     postId: string

     @ManyToOne(() => PostEntity)
     @JoinColumn({ name: "postId" })
     post?: PostEntity
}