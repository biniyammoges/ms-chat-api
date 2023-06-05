import { CreateCommentDto } from "../src/modules/post/dtos";
import { TestClient } from "./utils/client"
import { useClient, useTransaction } from "./utils/service/hooks"
import { userFixtures } from "./utils/fixtures/user.fixture";
import { commentFixtures, postFixtures } from "./utils/fixtures/post.fixture";
import { CommentEntity } from "../src/modules/post/entities/comment.entity";
import { PaginationEntity } from "src/shared";
import { UpdateCommentDto } from "src/modules/post/dtos/update-comment.dto";

describe("Post module", () => {
     let client: TestClient;
     useClient({ beforeAll: (cl) => client = cl, })

     describe("comment on post", () => {
          it("/comment/create - (POST) - return newly created comment!", async () => {
               await client.login()
               const body: CreateCommentDto = { text: "comment created!", postId: postFixtures.post1.id }

               const res = await client.requestApi<CreateCommentDto, CommentEntity>(`/comment/create`, { method: "post", body })
               expect(res.text).toBe(body.text)
               expect(res.commentorId).toBe(userFixtures.user0.id)
          })

          it("/comment/create - (POST) - return post not found error with unknown postId", async () => {
               await client.login()
               const body: CreateCommentDto = { text: "comment created!", postId: "046c1ca5-ccde-44dc-8a93-a81abe9b123c" }

               const res = await client.requestApi(`/comment/create`, { method: "post", body })
               expect(res.message).toBe("Post Not Found")
          })

          it("/comment/create - (POST) - return newly created reply!", async () => {
               await client.login()
               const body: CreateCommentDto = { text: "reply created!", parentCommentId: commentFixtures.comment0.id }

               const res = await client.requestApi<CreateCommentDto, CommentEntity>(`/comment/create`, { method: "post", body })
               expect(res.text).toBe(body.text)
               expect(res.commentorId).toBe(userFixtures.user0.id)
          })

          it("/comment/create - (POST) - return comment not found error with unknown parentCommentId", async () => {
               await client.login()
               const body: CreateCommentDto = { text: "comment created!", parentCommentId: "046c1ca5-ccde-44dc-8a93-a81abe9b123c" }

               const res = await client.requestApi(`/comment/create`, { method: "post", body })
               expect(res.message).toBe("Comment Not Found")
          })
     })


     describe("Retrieve comments", () => {
          it("/post/:postId/comments - (GET) should return paginated value of comments", async () => {
               await client.login()
               const res = await client.requestApi<any, PaginationEntity<CommentEntity>>(`/post/${postFixtures.post1.id}/comments`)
               expect(res.data[0].postId).toBe(postFixtures.post1.id)
          })

          it("/comment/:commentId/retrieve - (GET) - should return paginated value of replies", async () => {
               await client.login()
               const res = await client.requestApi<any, PaginationEntity<CommentEntity>>(`/comment/${commentFixtures.comment0.id}/retrieve`)
               expect(res.data[0].parentCommentId).toBe(commentFixtures.comment0.id)
          })
     })

     describe("update comment", () => {
          it("/comment/:commentId/comment - (PUT) should update comment", async () => {
               await client.login()

               const body: UpdateCommentDto = { text: "text_updated!" }
               const res = await client.requestApi<any, CommentEntity>(`/comment/${commentFixtures.comment0.id}/update`, { method: "put", body })
               expect(res.text).toBe(body.text)
          })

          it("/comment/:commentId/comment - (PUT) should return 404 error with unknown commentId", async () => {
               await client.login()

               const body: UpdateCommentDto = { text: "text_updated!" }
               const res = await client.requestApi(`/comment/${commentFixtures.comment2.id}/update`, { method: "put", body })
               expect(res.message).toBe("Comment Not Found")
          })
     })

     describe("delete comment", () => {
          it("/comment/:commentId/delete - (DELETE) should delete comment", async () => {
               await client.login()

               const res = await client.requestApi<any, { deleted: boolean, commentId: string }>(`/comment/${commentFixtures.comment0.id}/delete`, { method: "delete" })
               expect(res.deleted).toBe(true)
          })

          it("/comment/:commentId/delete - (DELETE) should return comment not found error with unknown or someone else commentId", async () => {
               await client.login()

               const res = await client.requestApi(`/comment/${commentFixtures.comment2.id}/delete`, { method: "delete" })
               expect(res.message).toBe('Comment Not Found')
          })

     })
})
