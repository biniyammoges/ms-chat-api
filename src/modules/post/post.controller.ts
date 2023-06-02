import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { PostService } from './post.service';
import { JwtAuthGuard } from '../auth/guards/at.guard';
import { CreatePostDto } from './dtos/create-post.dto';
import { GetUser, PaginationDto, PaginationEntity } from '../../shared';
import { LikePostDto, LikePostStatusDto } from './dtos/like-post.dto';
import { CreateCommentDto } from './dtos/create-comment.dto';
import { PostEntity } from './entities/post.entity';
import { PostLikeEntity } from './entities/post-like.entity';

@Controller('post')
@UseGuards(JwtAuthGuard)
export class PostController {
  constructor(private readonly postService: PostService) { }

  @Post('create')
  async create(@Body() data: CreatePostDto, @GetUser('id') creatorId: string) {
    return this.postService.create({ ...data, creatorId })
  }

  @Get('retireve')
  async retrievePosts(@GetUser('id') fetcherId: string, @Query() filter: PaginationDto): Promise<PaginationEntity<PostEntity>> {
    return this.postService.retrievePosts(fetcherId, filter)
  }

  @Get('retrieve/me')
  async retrieveMyPosts(@GetUser('id') id: string, @Query() filter: PaginationDto): Promise<PaginationEntity<PostEntity>> {
    return this.postService.retrieveMyPosts(id, filter)
  }

  @Post('/:postId/like')
  async likePost(@GetUser('id') likerId: string, @Param() likePostDto: LikePostDto, @Query() likePostStatusDto: LikePostStatusDto) {
    return this.postService.likePost(likePostDto, likerId, !!likePostStatusDto.unlike)
  }

  @Post('/:postId/like')
  async retrievePostLikes(@Param() likePostDto: LikePostDto): Promise<PaginationEntity<PostLikeEntity>> {
    return this.postService.retrievePostLikes(likePostDto)
  }

  @Post('/:postId/comment')
  async commentOnPost(@GetUser('id') commentorId: string, @Body() commentDto: CreateCommentDto) {
    // implement commenting feature
  }

}
