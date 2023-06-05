import { fileFixtures } from "./file.fixture";
import { followerFixture } from "./followe.fixture";
import { postFixtures, postLikeFixtures } from "./post.fixture";
import { userFixtures } from "./user.fixture";

export const fixtures = {
     users: userFixtures,
     followers: followerFixture,
     files: fileFixtures,
     posts: postFixtures,
     postsLikes: postLikeFixtures
}