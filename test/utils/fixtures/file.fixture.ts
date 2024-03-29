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
     }),

     file3: fixture(FileEntity, {
          name: 'image.png-1686324086146',
          size: 79945,
          type: 'upload',
          path: 'test_uploads/suulvmibrpz8nlocgazs',
          url: 'http://res.cloudinary.com/degfzcl69/image/upload/v1686324089/test_uploads/suulvmibrpz8nlocgazs.png',
          privateUrl: 'https://res.cloudinary.com/degfzcl69/image/upload/v1686324089/test_uploads/suulvmibrpz8nlocgazs.png',
          creatorId: '051ee4bc-df0f-494a-961b-0591f8d6694e',
          id: '30219203-1db0-4a64-be5f-4bc5c243e847',
          createdAt: '2023-06-09T12:21:29.661Z',
          updatedAt: '2023-06-09T12:21:29.661Z'
     }),

     file4: fixture(FileEntity, {
          name: 'image.png-1686384637861',
          size: 79945,
          type: 'upload',
          path: 'test_uploads/bpzbkplavktspy0hlyqv',
          url: 'http://res.cloudinary.com/degfzcl69/image/upload/v1686384640/test_uploads/bpzbkplavktspy0hlyqv.png',
          privateUrl: 'https://res.cloudinary.com/degfzcl69/image/upload/v1686384640/test_uploads/bpzbkplavktspy0hlyqv.png',
          creatorId: '051ee4bc-df0f-494a-961b-0591f8d6694e',
          id: '0847b215-8fbb-4a0c-9a08-07b7db29b7f6',
          createdAt: '2023-06-10T05:10:40.790Z',
          updatedAt: '2023-06-10T05:10:40.790Z'
     }),

     file5: fixture(FileEntity, {
          name: 'image.png-1688582100445',
          size: 79945,
          type: 'upload',
          path: 'test_uploads/zmdmsix4mcczfsre6vej',
          url: 'http://res.cloudinary.com/degfzcl69/image/upload/v1688582102/test_uploads/zmdmsix4mcczfsre6vej.png',
          privateUrl: 'https://res.cloudinary.com/degfzcl69/image/upload/v1688582102/test_uploads/zmdmsix4mcczfsre6vej.png',
          creatorId: '051ee4bc-df0f-494a-961b-0591f8d6694e',
          id: 'cab7d209-68c8-47f9-8ac2-0106e2b684a6',
          createdAt: '2023-07-05T15:35:03.044Z',
          updatedAt: '2023-07-05T15:35:03.044Z'
     })
}
