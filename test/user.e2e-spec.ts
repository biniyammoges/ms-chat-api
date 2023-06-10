import { UploadAvatarDto } from "src/modules/user/dtos/upload-avatar.dto";
import { TestClient } from "./utils/client"
import { useClient } from "./utils/service/hooks"
import { BaseFileDto } from "src/modules/file/dto/base-file.dto";
import { fileFixtures } from "./utils/fixtures/file.fixture";

describe("User controller", () => {
     let client: TestClient;

     useClient({ beforeAll: (tclient) => client = tclient })

     describe("Updoad avatar", () => {
          it("/user/upload/avatar - (POST) - should upload avatar", async () => {
               await client.login()
               const res = await client.requestApi<UploadAvatarDto, BaseFileDto>('/user/upload/avatar', { method: "post", body: { fileId: fileFixtures.file4.id } })
               expect(res.url).toBeDefined()
               expect(res.path).toBeDefined()
          })
     })
})