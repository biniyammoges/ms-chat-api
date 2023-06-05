import { PostLikeEntity } from "../../../src/modules/post/entities/post-like.entity";
import { PostMediaEntity } from "../../../src/modules/post/entities/post-media.entity";
import { PostEntity } from "../../../src/modules/post/entities/post.entity";
import { fixture } from "typeorm-fixture-builder";

export const postFixtures = {
     post0: fixture(PostEntity, {
          id: "096f4fa0-9540-477f-8647-55c2d2576f63",
          caption: "post0 caption",
          creatorId: "051ee4bc-df0f-494a-961b-0591f8d6694e",//user0 id
          medias: [fixture(PostMediaEntity, {
               id: "4ca6e345-5015-4985-9302-6da3dfa297dc",
               fileId: "7fd397d7-0cea-4875-8de6-f807625e501d",
          })]
     }),
     post1: fixture(PostEntity, {
          id: "905e6f54-791f-4098-ade9-3d9c93232951",
          caption: "post1 caption",
          creatorId: "85aceae5-b868-47de-8e19-44c6e70688b0",//user1 id
     })
}

export const postLikeFixtures = {
     postLike0: fixture(PostLikeEntity, {
          likerId: "051ee4bc-df0f-494a-961b-0591f8d6694e",//user0 id
          postId: "905e6f54-791f-4098-ade9-3d9c93232951" //post1 id
     }),
}