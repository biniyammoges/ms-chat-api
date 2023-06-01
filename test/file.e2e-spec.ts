import * as path from 'path'
import { TestClient } from './utils/client';
import { setupTestClient } from './utils/setup';
import { UploadApiResponse } from 'cloudinary';
import { fileFixtures } from './utils/fixtures/file.fixture';

describe('File module (e2e)', () => {
     let client: TestClient;

     beforeAll(async () => {
          client = await setupTestClient()
     });

     afterAll(async () => {
          await client.close()
     })

     describe("Upload single image", () => {
          it('/upload/image (POST) should upload file to server', async () => {
               await client.login()
               const res = await client.requestApi('/upload/image',
                    {
                         method: 'post',
                         uploads: [{ field: "file", path: path.join(process.cwd(), 'test/image.png') }]
                    }) as UploadApiResponse

               expect(res.type).toBeDefined();
               expect(res.url).toBeDefined();
          });

          it('/upload/image (POST) should return image only error message ', async () => {
               await client.login()
               const res = await client.requestApi('/upload/image',
                    {
                         method: 'post',
                         uploads: [{ field: "file", path: path.join(process.cwd(), 'test/file.txt') }]
                    })

               expect(res.statusCode).toBe(500)
          });
     })

     describe("Upload multiple images", () => {
          it('/upload/image (POST) should upload multiple files to server', async () => {
               await client.login()
               const res = await client.requestApi('/upload/images',
                    {
                         method: 'post',
                         uploads: [
                              { field: "files", path: path.join(process.cwd(), 'test/image.png') },
                              { field: "files", path: path.join(process.cwd(), 'test/image1.png') }]
                    }) as UploadApiResponse[]


               expect(res.length).toBeDefined();
               expect(res[0].url).toBeDefined();
          });

          it('/upload/image (POST) should return image only error message ', async () => {
               await client.login()
               const res = await client.requestApi('/upload/images',
                    {
                         method: 'post',
                         uploads: [
                              { field: "file", path: path.join(process.cwd(), 'test/file.txt') },
                              { field: "file", path: path.join(process.cwd(), 'test/image1.png') }]
                    })

               expect(res.message).toBe("Only image files are allowed!")
          });
     })

     describe("Delete uploaded file", () => {
          it("/uploads/:fileId (DELETE) should delete file by provided id", async () => {
               await client.login();
               const fileId = fileFixtures.file0.id
               const res = await client.requestApi(`/uploads/${fileId}`, { method: "delete" });
               expect(res.path).toBeDefined()
               expect(res.url).toBeDefined()
          })

          it("/uploads/:fileId (DELETE) should return not found error when there is not file with provided id", async () => {
               await client.login();

               // creator Id is user just for sample
               const fileId = fileFixtures.file0.creatorId
               const res = await client.requestApi(`/uploads/${fileId}`, { method: "delete" });
               expect(res.message).toBe('File Not Found')
          })
     })
});