import { FileEntity } from "../../../src/modules/file/file.entity";
import { fixture } from "typeorm-fixture-builder";

export const fileFixtures = {
     file0: fixture(FileEntity, {
          id: "937215a2-3fef-4274-bb4b-ab3abe1763c4",
          creatorId: "051ee4bc-df0f-494a-961b-0591f8d6694e",
          name: "file 1",
          path: "uploads/unknown-public-id",
          url: "unknown-url"
     }),
     file1: fixture(FileEntity, {
          id: "7fd397d7-0cea-4875-8de6-f807625e501d",
          path: 'test_uploads/ocevmsikcztqpmqblcag',
          type: 'png',
          createdAt: '2023-06-02T05:54:48Z',
          size: 158744,
          url: 'http://res.cloudinary.com/degfzcl69/image/upload/v1685685288/test_uploads/ocevmsikcztqpmqblcag.png',
          privateUrl: 'https://res.cloudinary.com/degfzcl69/image/upload/v1685685288/test_uploads/ocevmsikcztqpmqblcag.png',
          name: 'file',
     }),
     file2: fixture(FileEntity, {
          id: "1f44e42c-56d0-4666-9a2c-503324aeb650",
          path: 'test_uploads/zvh9fopjh7vlj851fbvx',
          type: 'png',
          createdAt: '2023-06-02T05:54:47Z',
          size: 79945,
          url: 'http://res.cloudinary.com/degfzcl69/image/upload/v1685685287/test_uploads/zvh9fopjh7vlj851fbvx.png',
          privateUrl: 'https://res.cloudinary.com/degfzcl69/image/upload/v1685685287/test_uploads/zvh9fopjh7vlj851fbvx.png',
     })
}

