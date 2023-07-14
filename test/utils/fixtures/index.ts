import { chatFixtures, chatRoomFixtures } from "./chat.fixture";
import { fileFixtures } from "./file.fixture";
import { followerFixture } from "./followe.fixture";
import { notificationFixtures } from "./notification.fixture";
import { commentFixtures, postFixtures, postLikeFixtures, savedPostFixtures } from "./post.fixture";
import { storyFixtures } from "./story.fixture";
import { userFixtures } from "./user.fixture";

export const fixtures = {
     users: userFixtures,
     followers: followerFixture,
     files: fileFixtures,
     posts: postFixtures,
     postsLikes: postLikeFixtures,
     savedPosts: savedPostFixtures,
     comments: commentFixtures,
     ntoifications: notificationFixtures,
     chatRooms: chatRoomFixtures,
     chats: chatFixtures,
     // stories: storyFixtures
}