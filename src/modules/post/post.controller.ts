import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { PostService } from './post.service';
import { JwtAuthGuard } from '../auth/guards/at.guard';
import { CreatePostDto, CommentIdDto, LikeStatusDto, PostIdDto, CreateCommentDto } from './dtos';
import { GetUser, PaginationDto, PaginationEntity } from '../../shared';

import { PostEntity } from './entities/post.entity';
import { PostLikeEntity } from './entities/post-like.entity';
import { CommentEntity } from './entities/comment.entity';
import { SavePostStatusDto } from './dtos/save-post-status.dto';

@Controller()
@UseGuards(JwtAuthGuard)
export class PostController {
  constructor(private readonly postService: PostService) { }

  @Post('post/create')
  async create(@Body() data: CreatePostDto, @GetUser('id') creatorId: string) {
    return this.postService.create({ ...data, creatorId })
  }

  @Get('post/retrieve/feed')
  async retrievePosts(@GetUser('id') fetcherId: string, @Query() filter: PaginationDto): Promise<PaginationEntity<PostEntity>> {
    return this.postService.retrievePosts(fetcherId, filter)
  }

  @Get('post/retrieve/me')
  async retrieveMyPosts(@GetUser('id') id: string, @Query() filter: PaginationDto): Promise<PaginationEntity<PostEntity>> {
    return this.postService.retrieveMyPosts(id, filter)
  }

  @Get('post/:postId/like')
  async likePost(@GetUser('id') likerId: string, @Param() postIdDto: PostIdDto, @Query() likeStatusDto: LikeStatusDto) {
    return this.postService.likePost(postIdDto, likerId, !!likeStatusDto.unlike)
  }

  @Get('post/:postId/save')
  async savePost(@GetUser('id') userId: string, @Param() postIdDto: PostIdDto, @Query() savePostStatusDto: SavePostStatusDto) {
    return this.postService.savePost(postIdDto, userId, !!savePostStatusDto.unsave)
  }

  @Get('post/:postId/likes')
  async retrievePostLikes(@Param() postIdDto: PostIdDto, @Query() filter: PaginationDto): Promise<PaginationEntity<PostLikeEntity>> {
    return this.postService.retrievePostLikes(postIdDto, filter)
  }

  @Get('post/:postId/comments')
  async retrieveComments(@Param() postIdDto: PostIdDto, @Query() filter: PaginationDto): Promise<PaginationEntity<CommentEntity>> {
    return this.postService.retrieveComments(postIdDto, filter)
  }

  @Post('comment/create')
  async createComment(@GetUser('id') commentorId: string, @Body() commentDto: CreateCommentDto) {
    return this.postService.createComment(commentDto, commentorId)
  }

  @Get('comment/:commentId/like')
  async likeComment(@GetUser('id') likerId: string, @Body() commentIdDto: CommentIdDto, @Query() likeStatusDto: LikeStatusDto) {
    return this.postService.likeComment(commentIdDto, likerId, !!likeStatusDto.unlike)
  }

  @Get('comment/:commentId/retrieve')
  async retrieveCommentReplies(@Param() commentIdDto: CommentIdDto, @Query() filter: PaginationDto): Promise<PaginationEntity<CommentEntity>> {
    return this.postService.retrieveCommentReplies(commentIdDto, filter)
  }
}
