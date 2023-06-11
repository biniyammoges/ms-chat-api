import { AbstractEntity } from "../../../shared";
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from "typeorm";
import { FileEntity } from "../../file/file.entity";
import { PostEntity } from "./post.entity";

@Entity()
export class PostMediaEntity extends AbstractEntity {
     @Column('uuid')
     fileId: string;

     @OneToOne(() => FileEntity, { onDelete: "CASCADE" })
     @JoinColumn({ name: "fileId" })
     file?: FileEntity

     @Column('uuid', { nullable: true })
     postId: string;

     @ManyToOne(() => PostEntity, { onDelete: "CASCADE", onUpdate: 'CASCADE' })
     @JoinColumn({ name: "postId" })
     post?: PostEntity
}