import { AbstractEntity } from "../../../shared";
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from "typeorm";
import { StoryEntity } from "./story.entity";
import { ChatEntity } from "src/modules/chat/entities/chat.entity";

@Entity()
export class StoryMessageEntity extends AbstractEntity {
     @Column('uuid')
     storyId: string;

     @ManyToOne(() => StoryEntity, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
     @JoinColumn({ name: 'storyId' })
     story?: StoryEntity;

     @Column('uuid')
     messageId: string

     @OneToOne(() => ChatEntity, { onDelete: 'CASCADE', onUpdate: 'CASCADE', })
     @JoinColumn({ name: 'messageId' })
     message?: ChatEntity;
}