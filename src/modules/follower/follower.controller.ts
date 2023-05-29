import { Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { GetUser } from 'src/shared/get-user.decrator';
import { FollowerService } from './follower.service';
import { JwtAuthGuard } from '../auth/guards/at.guard';
import { PaginationDto } from 'src/shared/pagination.dto';
import { PaginationEntity } from 'src/shared/pagination.entity';
import { FollowerEntity } from './entities/follower.entity';

@Controller()
@UseGuards(JwtAuthGuard)
export class FollowerController {
     constructor(private followerService: FollowerService) { }

     // returns followers of the following user
     @Get('followers/:username')
     async getFollowers(@GetUser('username') username: string, @Query() filter: PaginationDto): Promise<PaginationEntity<FollowerEntity>> {
          return this.followerService.getFollowers(username, filter);
     }

     // return users where user with username is following
     @Get('following/:username')
     async getFollowing(@GetUser('username') username: string, @Query() filter: PaginationDto): Promise<PaginationEntity<FollowerEntity>> {
          return this.followerService.getFollowings(username, filter);
     }

     @Patch('/follow/:username')
     async followUser(@GetUser('id') followerId: string, @Param('username') username: string): Promise<FollowerEntity> {
          return this.followerService.followUser(followerId, username)
     }

     @Post('/unfollow/:username')
     async unFollowUser(@GetUser('id') followerId: string, @Param('username') username: string): Promise<any> {
          return this.followerService.unfollowUser(followerId, username)
     }
}
