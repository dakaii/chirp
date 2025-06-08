import { Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { Comment } from '../entities/comment.entity';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { UpdateCommentDto } from '../dto/update-comment.dto';
import { User } from '../entities/user.entity';
import { Post } from '../entities/post.entity';

@Injectable()
export class CommentsService {
  constructor(private readonly em: EntityManager) {}

  async create(createCommentDto: CreateCommentDto): Promise<Comment> {
    const user = await this.em.findOne(User, { id: createCommentDto.userId });
    if (!user) {
      throw new NotFoundException(
        `User with ID ${createCommentDto.userId} not found`,
      );
    }

    const post = await this.em.findOne(Post, { id: createCommentDto.postId });
    if (!post) {
      throw new NotFoundException(
        `Post with ID ${createCommentDto.postId} not found`,
      );
    }

    const comment = new Comment();
    comment.content = createCommentDto.content;
    comment.user = user;
    comment.post = post;
    comment.createdAt = new Date();

    await this.em.persistAndFlush(comment);
    return comment;
  }

  async findByPost(postId: number): Promise<Comment[]> {
    const post = await this.em.findOne(Post, { id: postId });
    if (!post) {
      throw new NotFoundException(`Post with ID ${postId} not found`);
    }

    return this.em.find(Comment, { post }, { populate: ['user', 'post'] });
  }

  async findByUser(userId: number): Promise<Comment[]> {
    const user = await this.em.findOne(User, { id: userId });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return this.em.find(Comment, { user }, { populate: ['post', 'user'] });
  }

  async findOne(id: number): Promise<Comment | null> {
    return this.em.findOne(Comment, { id }, { populate: ['user', 'post'] });
  }

  async update(
    id: number,
    updateCommentDto: UpdateCommentDto,
  ): Promise<Comment | null> {
    const comment = await this.em.findOne(
      Comment,
      { id },
      { populate: ['user', 'post'] },
    );
    if (!comment) {
      return null;
    }

    if (updateCommentDto.content) {
      comment.content = updateCommentDto.content;
    }

    await this.em.persistAndFlush(comment);
    return comment;
  }

  async remove(id: number): Promise<Comment | null> {
    const comment = await this.em.findOne(Comment, { id });
    if (!comment) {
      return null;
    }

    await this.em.removeAndFlush(comment);
    return comment;
  }
}
