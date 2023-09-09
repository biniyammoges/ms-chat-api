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
     @Column('uuid')
     creatorId: string;

     @Column('longtext', { nullable: true })
     caption?: string;

     @ManyToOne(() => UserEntity, { onDelete: "CASCADE", onUpdate: 'CASCADE' })
     @JoinColumn({ name: "creatorId" })
     creator: UserEntity

     @OneToMany(() => PostMediaEntity, (pm) => pm.post, {
          cascade: true,
          eager: true
     })
     medias: PostMediaEntity[]

     @OneToMany(() => PostLikeEntity, (like) => like.post)
     likes: PostLikeEntity[]

     @OneToMany(() => CommentEntity, cm => cm.post)
     comments: CommentEntity[]

     @OneToMany(() => SavedPostEntity, sp => sp.post)
     savedUsers: SavedPostEntity[]

     @VirtualColumn()
     likeCount?: number

     @VirtualColumn()
     commentCount?: number

     @VirtualColumn()
     liked?: boolean
     @VirtualColumn()
     saved?: boolean
}