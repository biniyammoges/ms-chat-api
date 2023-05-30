import { PaginationEntity } from "../src/shared";
import { TestClient } from "./utils/client";
import { userFixtures } from "./utils/fixtures/user.fixture";
import { setupTestClient } from "./utils/setup";
import { FollowerEntity } from "../src/modules/follower/entities/follower.entity";
import { useClient, useTransaction } from "./utils/service/hooks";

describe('Follower module (e2e)', () => {
     let client: TestClient;

     useClient({ beforeAll: (cl) => (client = cl) })
     useTransaction({ before: 'all', client: () => client })

     it('/followers/:username (GET) should return error with unknown username', async () => {
          await client.login();
          const res = await client.requestApi(`/followers/unknown_username`);
          expect(res.message).toBe('User not found with provided username');
          expect(res.statusCode).toBe(400);
     });

     it('/followers/:username (GET) should return array of followers entity', async () => {
          await client.login();
          const username = userFixtures.user0.username
          const res = await client.requestApi(`/followers/${username}`) as PaginationEntity<FollowerEntity>;

          expect(res.data[0].followeeId).toBe(userFixtures.user0.id);
          expect(res.total).toBe(1);
     });

     it('/followings/:username (GET) should return error with unknown username', async () => {
          await client.login();
          const res = await client.requestApi(`/followings/unknown_username`);
          expect(res.message).toBe('User not found with provided username');
          expect(res.statusCode).toBe(400);
     });

     it('/followers/:username (GET) should return array of followings entity', async () => {
          await client.login();
          const username = userFixtures.user0.username
          const res = await client.requestApi(`/followings/${username}`) as PaginationEntity<FollowerEntity>;
          expect(res.data[0].followerId).toBe(userFixtures.user0.id);
          expect(res.total).toBe(2);
     });

     it('/follow/:username (GET) should return error if user is already following', async () => {
          await client.login();
          const username = userFixtures.user1.username
          const res = await client.requestApi(`/follow/${username}`);
          expect(res.message).toBe(`You are already following ${userFixtures.user1.firstName} ${userFixtures.user1.lastName}`);
     });

     it('/follow/:username (GET) should return error if user is already following', async () => {
          await client.login({ emailOrUsername: userFixtures.user2.username, password: "12345678" });
          const username = userFixtures.user1.username
          const res = await client.requestApi(`/follow/${username}`) as FollowerEntity;
          expect(res.followerId).toBe(userFixtures.user2.id);
     });

     it('/unfollow/:username (GET) should return error if user is not following', async () => {
          await client.login({ emailOrUsername: userFixtures.user2.username, password: "12345678" });
          const username = userFixtures.user0.username
          const res = await client.requestApi(`/unfollow/${username}`);
          expect(res.message).toBe(`You are not following ${userFixtures.user0.firstName} ${userFixtures.user0.lastName}`);
     });

     it('/unfollow/:username (GET) should unfollow the user', async () => {
          await client.login();
          const username = userFixtures.user1.username
          const res = await client.requestApi(`/unfollow/${username}`);
          expect(res.affected).toBe(1);
     });
});