import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { DeleteResult, EntityManager } from 'typeorm';
import { FollowerEntity } from './entities/follower.entity';
import { UserService } from '../user/user.service';
import { PaginationDto } from 'src/shared/pagination.dto';
import { PaginationEntity } from 'src/shared/pagination.entity';

@Injectable()
export class FollowerService {
     constructor(@InjectEntityManager() private em: EntityManager, private userService: UserService) { }

     private readonly logger = new Logger(FollowerService.name);

     async getFollowers(username: string, filter: PaginationDto): Promise<PaginationEntity<FollowerEntity>> {
          const offset = (filter.page - 1) * filter.limit

          const [followers, total] = await this.em.createQueryBuilder(FollowerEntity, 'f')
               .where('f.followeeId = :username', { username })
               .innerJoinAndSelect('f.follower', 'follower')
               .limit(filter.limit)
               .take(offset)
               .orderBy('f.createdAt', "DESC")
               .getManyAndCount();

          return new PaginationEntity({ data: followers, total })
     }

     async getFollowings(username: string, filter: PaginationDto): Promise<PaginationEntity<FollowerEntity>> {
          const offset = (filter.page - 1) * filter.limit

          const [followees, total] = await this.em.createQueryBuilder(FollowerEntity, 'f')
               .where('f.followerId = :username', { username })
               .innerJoinAndSelect('f.followee', 'followee')
               .limit(filter.limit)
               .take(offset)
               .orderBy('f.createdAt', "DESC")
               .getManyAndCount();

          return new PaginationEntity({ data: followees, total })
     }

     async followUser(followerId: string, username: string): Promise<FollowerEntity> {
          const user = await this.userService.findUserByUsername(username);
          const alreadyFollowing = await this.em.findOne(FollowerEntity, { where: { followerId, followeeId: user.id } });

          if (alreadyFollowing) {
               new BadRequestException(`You are already following ${user.firstName} ${user.lastName}`);
          }

          const newFollower = await this.em.create(FollowerEntity, { followerId, followeeId: user.id });
          return this.em.save(newFollower)
     }

     async unfollowUser(followerId: string, username: string): Promise<DeleteResult> {
          const user = await this.userService.findUserByUsername(username);
          const isFollowing = await this.em.findOne(FollowerEntity, { where: { followerId, followeeId: user.id } });

          if (!isFollowing) {
               new BadRequestException(`You are not following ${user.firstName} ${user.lastName}`);
          }

          return this.em.getRepository(FollowerEntity).delete({ followerId, followeeId: user.id });
     }
}
