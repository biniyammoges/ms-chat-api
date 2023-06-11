import { UserEntity } from "../../user/entities/user.entity";
import { AbstractEntity } from "../../../shared/base.entity";
import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";

@Entity()
@Index(['followerId', 'followeeId'], { unique: true })
export class FollowerEntity extends AbstractEntity {
     @Column('uuid')
     followerId: string;

     @ManyToOne(() => UserEntity, { onDelete: "CASCADE", onUpdate: 'CASCADE' })
     @JoinColumn({ name: 'followerId' })
     follower?: UserEntity

     @Column('uuid')
     followeeId: string;

     @ManyToOne(() => UserEntity, { onDelete: "CASCADE", onUpdate: 'CASCADE' })
     @JoinColumn({ name: 'followeeId' })
     followee?: UserEntity
}
