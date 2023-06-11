import { NotificationEntity } from '../src/modules/notification/entities/notification.entity';
import { PaginationEntity } from '../src/shared';
import { TestClient } from './utils/client'
import { userFixtures } from './utils/fixtures/user.fixture';
import { useClient } from './utils/service/hooks'

describe("Notification controller", () => {
     let client: TestClient;

     useClient({
          beforeAll(cl) {
               client = cl
          },
     })

     it("should return paginated result of notifications", async () => {
          await client.login();
          const res = await client.requestApi<any, PaginationEntity<NotificationEntity>>('/notification/retrieve');
          expect(res.data.length).toBeDefined()
          expect(res.total).toBeDefined()
     })

     it("should throw error if notification reciever and reader are not the same ", async () => {
          await client.login({ emailOrUsername: userFixtures.user1.email, password: '12345678' });
          const res = await client.requestApi('/notification/29bf027d-d8f5-4d6d-9b0a-a1b2dd4dbe26/read');
          expect(res.message).toBe('Notification Not Found')
     })

     it("should mark the notification as isRead to true and return isRead true", async () => {
          await client.login();
          const res = await client.requestApi<any, { isRead: boolean }>('/notification/29bf027d-d8f5-4d6d-9b0a-a1b2dd4dbe26/read');
          expect(res.isRead).toBe(true)
     })


     it("should make all unread notication to isRead to true and return isRead true", async () => {
          await client.login();
          const res = await client.requestApi<any, { isRead: boolean }>('/notification/read-all');
          expect(res.isRead).toBe(true)
     })
})