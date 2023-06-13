import { PaginationEntity } from "../src/shared"
import { TestClient } from "./utils/client"
import { useClient } from "./utils/service/hooks"
import { BaseChatDto, BaseChatRoomDto } from "../src/modules/chat/dtos/base-chat-room.dto"
import { userFixtures } from "./utils/fixtures/user.fixture"
import { chatRoomFixtures } from "./utils/fixtures/chat.fixture"

describe('chat-controller', () => {
     let client: TestClient
     useClient({
          beforeAll(cl) {
               client = cl
          },
     })

     /**
      * chat room fixture has two members (user0 and user1)
      * user0 sent two message and user1 sent two message
      */
     it("/chat/room/retrieve - (GET) - should retrieve all chat rooms where the retriever is in", async () => {
          await client.login()
          const res = await client.requestApi<any, PaginationEntity<BaseChatRoomDto>>('/chat/room/retrieve');

          expect(res.data).toBeDefined()
          expect(res.data[0].unreadCount).toBe(1)
          expect(res.total).toBeDefined()
     })

     /**
     * chat room fixture has two members (user0 and user1)
     * user0 sent two message and user1 sent two message
     */
     it("/chat/room/retrieve - (GET) - should retrieve all chat rooms where the retriever is in", async () => {
          await client.login({ emailOrUsername: userFixtures.user1.email, password: "12345678" })
          const res = await client.requestApi<any, PaginationEntity<BaseChatRoomDto>>('/chat/room/retrieve');

          expect(res.data).toBeDefined()
          expect(res.data[0].unreadCount).toBe(2)
          expect(res.total).toBeDefined()
     })

     it("/chat/room/:roomId/retrieve-chats - (GET) - should retrieve all chats from giver room ", async () => {
          await client.login()
          const res = await client.requestApi<any, PaginationEntity<BaseChatDto>>(`/chat/room/${chatRoomFixtures.room0.id}/retrieve-chats`);

          expect(res.data.every(c => c.chatRoomId === chatRoomFixtures.room0.id)).toBeTruthy()
          expect(res.data.length).toBeDefined()
          expect(res.total).toBeDefined()
     })
})