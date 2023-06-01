import { AbstractEntity } from "../../shared";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { UserEntity } from "../user/entities/user.entity";

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

     @ManyToOne(() => UserEntity, { onDelete: 'SET NULL' })
     @JoinColumn({ name: "creatorId", })
     creator?: UserEntity
}

