import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { CreatePostDto } from './dtos/create-post.dto';
import { PostEntity } from './entities/post.entity';
import { FollowerService } from '../follower/follower.service';
import { PaginationDto, PaginationEntity } from 'src/shared';

@Injectable()
export class PostService {
     constructor(@InjectEntityManager() private em: EntityManager, private followerService: FollowerService) { }

     async create(data: CreatePostDto & { creatorId: string }) {
          const post = await this.em.create(PostEntity, data);

          const followers = await this.followerService.getFollowers(data.creatorId);
          // TODO - emit 'new-post' to all followers 

          return this.em.save(post);
     }

     // TODO - retrieve posts with comments like and replies
     async retrievePosts(fetchorId: string, filter: PaginationDto = { page: 1, limit: 50 }) {
          const [posts, total] = await this.em.createQueryBuilder(PostEntity, 'p')
               .innerJoin("p.creator", "creator")
               .innerJoin("creator.followers", "followers")
               .where("followers.followerId = :fetchorId", { fetchorId })
               .orWhere("p.creatorId = :fetcherId", { fetchorId })
               .limit(filter.limit)
               .skip((filter.page - 1) * filter.limit)
               .orderBy("p.createdAt", "DESC")
               .getManyAndCount();

          return new PaginationEntity({ data: posts, total })
     }

     async retrieveMyPosts(id: string, filter: PaginationDto = { page: 1, limit: 50 }) {
          const [posts, total] = await this.em.createQueryBuilder(PostEntity, 'p')
               .orWhere("p.creatorId = :id", { id })
               .limit(filter.limit)
               .skip((filter.page - 1) * filter.limit)
               .orderBy("p.createdAt", "DESC")
               .getManyAndCount();

          return new PaginationEntity({ data: posts, total })
     }
}
