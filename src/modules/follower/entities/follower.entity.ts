import { UserEntity } from "../../user/entities/user.entity";
import { AbstractEntity } from "../../../shared/base.entity";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";

@Entity()
export class FollowerEntity extends AbstractEntity {
     @Column()
     followerId: string;

     @ManyToOne(() => UserEntity)
     @JoinColumn({ name: 'followerId' })
     follower?: UserEntity

     @Column()
     followingId: string;

     @ManyToOne(() => UserEntity)
     @JoinColumn({ name: 'followingId' })
     following?: UserEntity
}
