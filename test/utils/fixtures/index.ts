import { fileFixtures } from "./file.fixture";
import { followerFixture } from "./followe.fixture";
import { commentFixtures, postFixtures, postLikeFixtures, savedPostFixtures } from "./post.fixture";
import { userFixtures } from "./user.fixture";

export const fixtures = {
     users: userFixtures,
     followers: followerFixture,
     files: fileFixtures,
     posts: postFixtures,
     postsLikes: postLikeFixtures,
     savedPosts: savedPostFixtures,
     comments: commentFixtures
}