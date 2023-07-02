import { StoryEntity } from "src/modules/story/entities/story.entity";
import { fixture } from "typeorm-fixture-builder";

export const storyFixtures = {
     story0: fixture(StoryEntity, {
     }),
}