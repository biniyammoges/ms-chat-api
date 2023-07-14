import { StoryEntity } from "../../../src/modules/story/entities/story.entity";
import { fixture } from "typeorm-fixture-builder";

export const storyFixtures = {
     story0: fixture(StoryEntity, {
          id: "e14bd785-d192-4154-a1cc-28b9d6e75479",
          creatorId: "051ee4bc-df0f-494a-961b-0591f8d6694e",
          isArchived: false,
          medias: [{ fileId: "0847b215-8fbb-4a0c-9a08-07b7db29b7f6" }],
          viewers: [{ viewerId: "85aceae5-b868-47de-8e19-44c6e70688b0" }, { viewerId: "1f4cd8b4-37e5-4079-a132-dc5addaa9555" }],
     }),
}