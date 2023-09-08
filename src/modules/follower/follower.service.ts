import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { DeleteResult, EntityManager } from 'typeorm';
import { FollowerEntity } from './entities/follower.entity';
import { UserService } from '../user/user.service';
import { PaginationDto, getNotificationMessage } from '../../shared';
import { PaginationEntity } from '../../shared';
import { NotificationService } from '../notification/notification.service';
import { NotificationType } from '../notification/entities/notification.entity';

@Injectable()
export class FollowerService {
     constructor(
          @InjectEntityManager()
          private em: EntityManager,
          private userService: UserService,
          private notificationService: NotificationService) { }

     private readonly logger = new Logger(FollowerService.name);

     /**
      * 
      * @param {string} username - used to fetch follower data
      * @param {PaginationDto} filter - has limit and page properties for pagination
      * @param {boolean} fetchFollowers  - used to fetch followers and following
      * @returns {PaginationEntity<FollowerEntity>}
      */
     async getFollowers(username: string, filter: PaginationDto = {}, fetchFollowers = true): Promise<PaginationEntity<FollowerEntity>> {
          await this.userService.findUserByUsername(username)

          const followerQry = this.em.createQueryBuilder(FollowerEntity, 'f');

          // TODO - optimize following query to return only requried fields from relations
          if (fetchFollowers) {
               followerQry.innerJoin('f.followee', 'followee')
                    .innerJoinAndSelect('f.follower', 'follower')
                    .leftJoinAndSelect('follower.avatar', 'avatar')
                    .where('followee.username = :username', { username })
          } else {
               followerQry.innerJoin('f.follower', 'follower')
                    .innerJoinAndSelect('f.followee', 'followee')
                    .leftJoinAndSelect('followee.avatar', 'avatar')
                    .where('follower.username = :username', { username })
          }

          if (filter?.limit)
               followerQry.limit(filter.limit);
          if (filter?.limit && filter?.page)
               followerQry.skip((filter.page - 1) * filter.limit)

          const [followers, total] = await followerQry
               .orderBy('f.createdAt', "DESC")
               .getManyAndCount();

          return new PaginationEntity({ data: followers, total })
     }

     async followUser(follower: { id: string, username: string }, username: string): Promise<FollowerEntity> {
          const user = await this.userService.findUserByUsername(username);

          if (follower.id === user.id)
               throw new BadRequestException("You can't follow or unfollow yourself")

          const alreadyFollowing = await this.em.findOne(FollowerEntity, { where: { followerId: follower.id, followeeId: user.id } });

          if (alreadyFollowing) {
               throw new BadRequestException(`You are already following ${user.firstName} ${user.lastName}`);
          }

          const newFollower = await this.em.create(FollowerEntity, { followerId: follower.id, followeeId: user.id });
          await this.notificationService.sendNotification({
               action: `user/${follower.username}`,
               message: getNotificationMessage({ type: NotificationType.Follow, username: follower.username }),
               receiverId: user.id,
               senderId: follower.id,
               type: NotificationType.Follow
          })
          return this.em.save(newFollower)
     }

     async unfollowUser(followerId: string, username: string): Promise<DeleteResult> {
          const user = await this.userService.findUserByUsername(username);
          if (followerId === user.id)
               throw new BadRequestException("You can't follow or unfollow yourself")


          const isFollowing = await this.em.findOne(FollowerEntity, { where: { followerId, followeeId: user.id } });

          if (!isFollowing) {
               throw new BadRequestException(`You are not following ${user.firstName} ${user.lastName}`);
          }

          return this.em.getRepository(FollowerEntity).delete({ followerId, followeeId: user.id });
     }
}
