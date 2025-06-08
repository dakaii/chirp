import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Post } from '../entities/post.entity';
import { User } from '../entities/user.entity';
import { PostsController } from '../controllers/posts.controller';
import { PostsService } from '../services/posts.service';
import { UsersModule } from './users.module';

@Module({
  imports: [MikroOrmModule.forFeature([Post, User]), UsersModule],
  controllers: [PostsController],
  providers: [PostsService],
  exports: [PostsService],
})
export class PostsModule {}
