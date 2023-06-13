import { ChatUserEntity } from "../../../src/modules/chat/entities/chat-user.entity";
import { ChatRoomEntity } from "../../../src/modules/chat/entities/chat-room.entity";
import { fixture } from "typeorm-fixture-builder";
import { ChatEntity } from "../../../src/modules/chat/entities/chat.entity";

export const chatRoomFixtures = {
     room0: fixture(ChatRoomEntity, {
          id: "2f6caff1-0388-4338-93cf-bd797ceb7a39",
          chatUsers: [
               fixture(ChatUserEntity, {
                    id: "3c005f30-89b0-4f1b-a742-90e33bdd5fb1",
                    userId: "051ee4bc-df0f-494a-961b-0591f8d6694e",
               }),
               fixture(ChatUserEntity, {
                    id: "69e05bc2-3305-4d9b-9213-4006432ed1f3",
                    userId: "85aceae5-b868-47de-8e19-44c6e70688b0",
               }),
          ]
     })
}

export const chatFixtures = {
     chat0: fixture(ChatEntity, {
          chatRoomId: '2f6caff1-0388-4338-93cf-bd797ceb7a39',
          message: 'hi binix!',
          senderId: "85aceae5-b868-47de-8e19-44c6e70688b0",
     }),
     chat1: fixture(ChatEntity, {
          chatRoomId: '2f6caff1-0388-4338-93cf-bd797ceb7a39',
          message: 'hey johnny!',
          senderId: "051ee4bc-df0f-494a-961b-0591f8d6694e",
     }),
     chat2: fixture(ChatEntity, {
          chatRoomId: '2f6caff1-0388-4338-93cf-bd797ceb7a39',
          message: 'how are you doing buddy, long time no see',
          senderId: "051ee4bc-df0f-494a-961b-0591f8d6694e",
     }),
}