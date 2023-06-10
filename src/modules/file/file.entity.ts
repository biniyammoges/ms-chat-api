import { AbstractEntity } from "../../shared";
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from "typeorm";
import { UserEntity } from "../user/entities/user.entity";
import { PostMediaEntity } from "../post/entities/post-media.entity";

@Entity()
export class FileEntity extends AbstractEntity {
     @Column({ nullable: true })
     name?: string

     @Column({ nullable: true })
     size?: number

     @Column({ nullable: true })
     type: string

     @Column()
     path: string

     @Column()
     url: string

     @Column({ nullable: true })
     privateUrl?: string

     @Column({ nullable: true })
     creatorId?: string

     @ManyToOne(() => UserEntity, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
     @JoinColumn({ name: "creatorId", })
     creator?: UserEntity

     @OneToOne(() => PostMediaEntity, pm => pm.file, { onDelete: "CASCADE" })
     postMedia?: PostMediaEntity

     @OneToOne(() => UserEntity, u => u.avatar)
     avatar?: UserEntity
}

