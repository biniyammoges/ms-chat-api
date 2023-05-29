import { FollowerEntity } from "../../../src/modules/follower/entities/follower.entity";
import { fixture } from "typeorm-fixture-builder";

export const followerFixture = {
     follow0: fixture(FollowerEntity, {
          id: "c9d4fe98-1953-11ed-861d-0242ac120002",
          followeeId: "051ee4bc-df0f-494a-961b-0591f8d6694e", //user0
          followerId: "85aceae5-b868-47de-8e19-44c6e70688b0", //user1
     }),

     follow1: fixture(FollowerEntity, {
          id: "950ba5a8-3580-4bbc-9317-238fccd93f54",
          followeeId: "85aceae5-b868-47de-8e19-44c6e70688b0", // user1
          followerId: "051ee4bc-df0f-494a-961b-0591f8d6694e", // user0
     }),

     follow2: fixture(FollowerEntity, {
          id: "0e079627-f5fc-4742-a8f5-595741eb7c1c",
          followeeId: "1f4cd8b4-37e5-4079-a132-dc5addaa9555", // user2
          followerId: "051ee4bc-df0f-494a-961b-0591f8d6694e", // user0
     }),
}