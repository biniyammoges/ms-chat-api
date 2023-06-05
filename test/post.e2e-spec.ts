import { PaginationEntity } from "../src/shared";
import { CreatePostDto } from "../src/modules/post/dtos";
import { TestClient } from "./utils/client"
import { fileFixtures } from "./utils/fixtures/file.fixture";
import { useClient, useTransaction } from "./utils/service/hooks"
import { PostEntity } from "../src/modules/post/entities/post.entity";
import { userFixtures } from "./utils/fixtures/user.fixture";
import { PostLikeEntity } from "../src/modules/post/entities/post-like.entity";
import { postFixtures } from "./utils/fixtures/post.fixture";
import { SavedPostEntity } from "../src/modules/post/entities/saved-post.entity";

describe("Post module", () => {
     let client: TestClient;
     useClient({ beforeAll: (cl) => client = cl, })
     useTransaction({ client: () => client, before: 'each' })

     describe("create post", () => {
          it("/post/create - (POST) - should create post with caption only", async () => {
               await client.login()
               const postDto: CreatePostDto = {
                    caption: "post created!",
               }
               const res = await client.requestApi<CreatePostDto, PostEntity>("/post/create", { method: "post", body: postDto })
               expect(res.caption).toBe("post created!")
          })

          it("/post/create - (POST) - should return error if there is no caption and medias", async () => {
               await client.login()
               const res = await client.requestApi("/post/create", { method: "post", body: {} })
               expect(res.message).toBe("Both caption and files can't be empty")
               expect(res.statusCode).toBe(400)
          })

          it("/post/create - (POST) - should create post with media", async () => {
               await client.login()
               const body: CreatePostDto = { caption: "caption created!", medias: [{ fileId: fileFixtures.file2.id }] }
               const res = await client.requestApi<CreatePostDto, PostEntity>("/post/create", { method: "post", body })
               expect(res.caption).toBe("caption created!")
               expect(res.medias[0].fileId).toBe(fileFixtures.file2.id)
          })
     })

     describe("fetch posts", () => {
          it("/post/retrieve/feed - (GET) - return paginated result of posts", async () => {
               await client.login()
               const res = await client.requestApi<any, PaginationEntity<PostEntity>>('/post/retrieve/feed')
               expect(res.data.map(d => d.creatorId).includes(userFixtures.user0.id)).toBe(true)
          })

          it("/post/retrieve/me - (GET) - return paginated result of my posts", async () => {
               await client.login()
               const res = await client.requestApi<any, PaginationEntity<PostEntity>>('/post/retrieve/me')
               expect(res.data[0].creatorId).toBe(userFixtures.user0.id)
          })
     })

     describe("like post", () => {
          it("/post/:postId/likes - (GET) - return array of likes", async () => {
               await client.login()
               const res = await client.requestApi<any, PaginationEntity<PostLikeEntity>>(`/post/${postFixtures.post1.id}/likes`)
               expect(res.data.length).toBe(1)
          })

          it("/post/:postId/like - (GET) - should like post and return like result", async () => {
               await client.login()
               const res = await client.requestApi<any, PostLikeEntity>(`/post/${postFixtures.post0.id}/like`)
               expect(res.likerId).toBe(userFixtures.user0.id)
          })

          it("/post/:postId/like - (GET) - return you already liked the post error", async () => {
               await client.login()
               const res = await client.requestApi(`/post/${postFixtures.post1.id}/like`)
               expect(res.message).toBe("You already liked the post")
          })

          it("/post/:postId/like?unlike=true - (GET) - should unlike post", async () => {
               await client.login()
               const res = await client.requestApi<any, { unlike: boolean }>(`/post/${postFixtures.post1.id}/like?unlike=true`)
               expect(res.unlike).toBe(true)
          })

          // this time post1 is unliked. data continued from last test case
          it("/post/:postId/like?unlike=true - (GET) - return error if already unliked", async () => {
               await client.login()
               const res = await client.requestApi(`/post/${postFixtures.post1.id}/like?unlike=true`)
               expect(res.message).toBe("You didn't like the post")
          })
     })

     describe("save post", () => {
          it("/post/:postId/save - (GET) - should return post not fount if postId doesn't exist", async () => {
               await client.login()
               const res = await client.requestApi(`/post/051ee4bc-df0f-494a-961b-0591f8d6694e/save`)
               expect(res.message).toBe("Post Not Found")
          })

          it("/post/:postId/save - (GET) - should save post and return save result", async () => {
               await client.login()
               const res = await client.requestApi<any, SavedPostEntity>(`/post/${postFixtures.post0.id}/save`)
               expect(res.userId).toBe(userFixtures.user0.id)
          })

          it("/post/:postId/save - (GET) - return you already save the post error", async () => {
               await client.login()
               const res = await client.requestApi(`/post/${postFixtures.post1.id}/save`)
               expect(res.message).toBe("You already saved the post")
          })

          it("/post/:postId/save?unsave=true - (GET) - should unlike post", async () => {
               await client.login()
               const res = await client.requestApi<any, { unsaved: boolean }>(`/post/${postFixtures.post1.id}/save?unsave=true`)
               expect(res.unsaved).toBe(true)
          })

          // this time post1 is unliked. data continued from last test case
          it("/post/:postId/save?unsave=true - (GET) - return error if already unsaved", async () => {
               await client.login()
               const res = await client.requestApi(`/post/${postFixtures.post1.id}/save?unsave=true`)
               expect(res.message).toBe("You didn't save the post")
          })
     })
})