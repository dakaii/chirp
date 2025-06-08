import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';
import { CreatePostDto } from '../dto/create-post.dto';
import { UpdatePostDto } from '../dto/update-post.dto';
import { Post } from '../entities/post.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: EntityRepository<Post>,
  ) {}

  async create(createPostDto: CreatePostDto, user: User): Promise<Post> {
    const post = this.postRepository.create({
      ...createPostDto,
      user,
      createdAt: new Date(),
    });
    await this.postRepository.persistAndFlush(post);
    return post;
  }

  async findAll(): Promise<Post[]> {
    return this.postRepository.findAll({
      populate: ['user'],
    });
  }

  async findOne(id: number): Promise<Post | null> {
    return this.postRepository.findOne(id, {
      populate: ['user', 'comments'],
    });
  }

  async findByUser(userId: number): Promise<Post[]> {
    return this.postRepository.find(
      { user: userId },
      {
        populate: ['comments'],
      },
    );
  }

  async update(id: number, updatePostDto: UpdatePostDto): Promise<Post | null> {
    const post = await this.postRepository.findOne(id);
    if (!post) return null;

    this.postRepository.assign(post, updatePostDto);
    await this.postRepository.flush();
    return post;
  }

  async remove(id: number): Promise<boolean> {
    const post = await this.postRepository.findOne(id);
    if (!post) return false;

    await this.postRepository.removeAndFlush(post);
    return true;
  }
}
