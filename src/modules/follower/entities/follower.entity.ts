import { UserEntity } from "../../user/entities/user.entity";
import { AbstractEntity } from "../../../shared/base.entity";
import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";

@Entity()
@Index(['followerId', 'followeeId'], { unique: true })
export class FollowerEntity extends AbstractEntity {
     @Column()
     followerId: string;

     @ManyToOne(() => UserEntity)
     @JoinColumn({ name: 'followerId' })
     follower?: UserEntity

     @Column()
     followeeId: string;

     @ManyToOne(() => UserEntity)
     @JoinColumn({ name: 'followeeId' })
     followee?: UserEntity
}
