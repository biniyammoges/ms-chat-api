import { StoryEntity } from "src/modules/story/entities/story.entity";
import { fixture } from "typeorm-fixture-builder";

export const storyFixtures = {
     story0: fixture(StoryEntity, {
          id: "",
          creatorId: "",
          isArchived: false,
          medias: [{ fileId: "" }, { fileId: "" }],
          viewers: [{ viewerId: "" }, { viewerId: "" }],
     }),
}