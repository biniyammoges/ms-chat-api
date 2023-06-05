import { UserEntity } from "../../user/entities/user.entity";
import { AbstractEntity } from "../../../shared";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { PostMediaEntity } from "./post-media.entity";
import { PostLikeEntity } from "./post-like.entity";
import { CommentEntity } from "./comment.entity";
import { SavedPostEntity } from "./saved-post.entity";
import { VirtualColumn } from "../../../decorators/virtual-column.decorator";

@Entity()
export class PostEntity extends AbstractEntity {
     @Column()
     creatorId: string;

     @Column({ nullable: true })
     caption?: string;

     @ManyToOne(() => UserEntity)
     @JoinColumn({ name: "creatorId" })
     creator: UserEntity

     @OneToMany(() => PostMediaEntity, (pm) => pm.post, {
          cascade: true,
          onDelete: "CASCADE",
          eager: true
     })
     medias: PostMediaEntity[]

     @OneToMany(() => PostLikeEntity, (like) => like.post, { onDelete: "CASCADE" })
     likes: PostLikeEntity[]

     @OneToMany(() => CommentEntity, cm => cm.post, { onDelete: "CASCADE" })
     comments: CommentEntity[]

     @OneToMany(() => SavedPostEntity, sp => sp.post, { onDelete: "CASCADE" })
     savedUsers: SavedPostEntity[]

     @VirtualColumn()
     likeCount?: number

     @VirtualColumn()
     commentCount?: number
}