import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { PostService } from './post.service';
import { JwtAuthGuard } from '../auth/guards/at.guard';
import { CreatePostDto, CommentIdDto, LikeStatusDto, PostIdDto, CreateCommentDto } from './dtos';
import { GetUser, PaginationEntity } from '../../shared';

import { PostEntity } from './entities/post.entity';
import { PostLikeEntity } from './entities/post-like.entity';
import { CommentEntity } from './entities/comment.entity';
import { SavePostStatusDto } from './dtos/save-post-status.dto';
import { UpdatePostDto } from './dtos/update-post.dto';
import { UpdateResult } from 'typeorm';
import { UpdateCommentDto } from './dtos/update-comment.dto';

@Controller()
@UseGuards(JwtAuthGuard)
export class PostController {
  constructor(private readonly postService: PostService) { }

  @Post('post/create')
  async create(@Body() data: CreatePostDto, @GetUser('id') creatorId: string) {
    return this.postService.create({ ...data, creatorId })
  }

  @Put('post/:postId/update')
  async updatePost(@GetUser('id') updaterId: string, @Body() updatePostDto: UpdatePostDto, @Param() postIdDto: PostIdDto): Promise<UpdateResult> {
    return this.postService.updatePost(postIdDto.postId, updatePostDto, updaterId)
  }

  @Delete('post/:postId/delete')
  async deletePost(@Param() postIdDto: PostIdDto, @GetUser('id') userId: string): Promise<any> {
    return this.postService.deletePost(postIdDto.postId, userId)
  }

  @Get('post/retrieve/feed')
  async retrievePosts(@GetUser('id') fetcherId: string, @Query('limit') limit: number = 20, @Query('page') page: number = 1): Promise<PaginationEntity<PostEntity>> {
    return this.postService.retrievePosts(fetcherId, { limit, page })
  }

  @Get('post/retrieve/me')
  async retrieveMyPosts(@GetUser('id') id: string, @Query('limit') limit: number = 20, @Query('page') page: number = 1): Promise<PaginationEntity<PostEntity>> {
    return this.postService.retrieveMyPosts(id, { limit, page })
  }

  @Get('post/:postId/like')
  async likePost(@GetUser('id') likerId: string, @Param() postIdDto: PostIdDto, @Query() likeStatusDto: LikeStatusDto) {
    return this.postService.likePost(postIdDto, likerId, !!likeStatusDto.unlike)
  }

  @Get('post/:postId/likes')
  async retrievePostLikes(@Param() postIdDto: PostIdDto, @Query('limit') limit: number = 20, @Query('page') page: number = 1): Promise<PaginationEntity<PostLikeEntity>> {
    return this.postService.retrievePostLikes(postIdDto, { limit, page })
  }

  @Get('post/:postId/save')
  async savePost(@GetUser('id') userId: string, @Param() postIdDto: PostIdDto, @Query() savePostStatusDto: SavePostStatusDto) {
    return this.postService.savePost(postIdDto, userId, !!savePostStatusDto.unsave)
  }

  @Post('comment/create')
  async createComment(@GetUser('id') commentorId: string, @Body() commentDto: CreateCommentDto) {
    return this.postService.createComment(commentDto, commentorId)
  }

  @Get('comment/:commentId/like')
  async likeComment(@GetUser('id') likerId: string, @Body() commentIdDto: CommentIdDto, @Query() likeStatusDto: LikeStatusDto) {
    return this.postService.likeComment(commentIdDto, likerId, !!likeStatusDto.unlike)
  }

  @Get('post/:postId/comments')
  async retrieveComments(@Param() postIdDto: PostIdDto, @Query('limit') limit: number = 20, @Query('page') page: number = 1): Promise<PaginationEntity<CommentEntity>> {
    return this.postService.retrieveComments(postIdDto, { limit, page })
  }

  @Get('comment/:commentId/retrieve')
  async retrieveCommentReplies(@Param() commentIdDto: CommentIdDto, @Query('limit') limit: number = 20, @Query('page') page: number = 1): Promise<PaginationEntity<CommentEntity>> {
    return this.postService.retrieveCommentReplies(commentIdDto, { limit, page })
  }

  @Put('comment/:commentId/update')
  async updateComment(@GetUser('id') updaterId: string, @Body() updateCommentDto: UpdateCommentDto, @Param() commentIdDto: CommentIdDto): Promise<any> {
    return this.postService.updateComment(commentIdDto.commentId, updateCommentDto, updaterId)
  }

  @Delete('comment/:commentId/delete')
  async deleteComment(@Param() commentIdDto: CommentIdDto, @GetUser('id') userId: string): Promise<any> {
    return this.postService.deleteComment(commentIdDto.commentId, userId)
  }
}
