import { UserEntity } from "../../user/entities/user.entity";
import { AbstractEntity } from "../../../shared";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { PostMediaEntity } from "./post-media.entity";

@Entity()
export class PostEntity extends AbstractEntity {
     @Column()
     creatorId: string;

     @Column({ nullable: true })
     caption?: string;

     @ManyToOne(() => UserEntity)
     @JoinColumn({ name: "creatorId" })
     creator: UserEntity

     @OneToMany(() => PostMediaEntity, (pm) => pm.postId, {
          cascade: ["insert", "recover", "remove", "update"],
          eager: true
     })
     medias: PostMediaEntity[]
}