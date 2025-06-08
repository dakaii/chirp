import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Post } from '../entities/post.entity';
import { User } from '../entities/user.entity';
import { PostsController } from '../controllers/posts.controller';
import { PostsService } from '../services/posts.service';
import { UsersModule } from './users.module';
import { CommentsModule } from './comments.module';

@Module({
  imports: [
    MikroOrmModule.forFeature([Post, User]),
    UsersModule,
    CommentsModule,
  ],
  controllers: [PostsController],
  providers: [PostsService],
  exports: [PostsService],
})
export class PostsModule {}
