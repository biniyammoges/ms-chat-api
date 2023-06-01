import { FileEntity } from "../../../src/modules/file/file.entity";
import { fixture } from "typeorm-fixture-builder";

export const fileFixtures = {
     file0: fixture(FileEntity, {
          id: "937215a2-3fef-4274-bb4b-ab3abe1763c4",
          creatorId: "051ee4bc-df0f-494a-961b-0591f8d6694e",
          name: "file 1",
          path: "uploads/unknown-public-id",
          url: "unknown-url"
     })
}

