import { AbstractEntity } from "../../../shared";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { StoryEntity } from "./story.entity";
import { UserEntity } from "../../user/entities/user.entity";

@Entity()
export class StoryViewerEntity extends AbstractEntity {
     @Column('uuid')
     storyId: string;

     @ManyToOne(() => StoryEntity, { onDelete: 'CASCADE' })
     @JoinColumn({ name: 'storyId' })
     story?: StoryEntity;

     @Column('uuid')
     viewerId: string;

     @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
     @JoinColumn({ name: 'viewerId' })
     viewer?: UserEntity;
}