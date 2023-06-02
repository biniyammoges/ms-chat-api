import { AbstractEntity } from "../../../shared";
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from "typeorm";
import { FileEntity } from "../../file/file.entity";
import { PostEntity } from "./post.entity";

@Entity()
export class PostMediaEntity extends AbstractEntity {
     @Column()
     fileId: string;

     @OneToOne(() => FileEntity)
     @JoinColumn({ name: "fileId" })
     file?: FileEntity

     @Column()
     postId: string;

     @ManyToOne(() => FileEntity)
     @JoinColumn({ name: "postId" })
     post?: PostEntity
}