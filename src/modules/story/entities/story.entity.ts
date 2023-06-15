import { UserEntity } from "../../user/entities/user.entity";
import { AbstractEntity } from "../../../shared";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { StoryMediaEntity } from "./story-media.entity";
import { StoryViewerEntity } from "./story-viewer.entity";
import { StoryMessageEntity } from "./story-message.entity";

@Entity()
export class StoryEntity extends AbstractEntity {
     @Column('uuid')
     creatorId: string

     @ManyToOne(() => UserEntity, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
     @JoinColumn({ name: "creatorId" })
     creator: UserEntity

     @Column('date')
     expire: Date

     @Column('bool', { default: false })
     isExpired: boolean;

     @OneToMany(() => StoryMediaEntity, sme => sme.story, { eager: true, cascade: true })
     medias?: StoryMediaEntity[]

     @OneToMany(() => StoryViewerEntity, sve => sve.story, { eager: true })
     viewers?: StoryViewerEntity[]

     @OneToMany(() => StoryMessageEntity, sme => sme.story)
     storyMessages: StoryMessageEntity[]
}