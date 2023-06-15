import { AbstractEntity } from "../../../shared";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { StoryEntity } from "./story.entity";
import { FileEntity } from "../../file/file.entity";

@Entity()
export class StoryMediaEntity extends AbstractEntity {
     @Column('uuid', { nullable: true })
     storyId: string;

     @ManyToOne(() => StoryEntity, { onDelete: 'CASCADE' })
     @JoinColumn({ name: 'storyId' })
     story?: StoryEntity;

     @Column('uuid')
     fileId: string;

     @ManyToOne(() => FileEntity, { onDelete: 'CASCADE' })
     @JoinColumn({ name: 'fileId' })
     file?: FileEntity;
}