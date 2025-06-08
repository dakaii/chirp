import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { PostsService } from '../services/posts.service';
import { PostsController } from '../controllers/posts.controller';
import { Post } from '../entities/post.entity';
import { UsersModule } from './users.module';

@Module({
  imports: [MikroOrmModule.forFeature([Post]), UsersModule],
  controllers: [PostsController],
  providers: [PostsService],
  exports: [PostsService],
})
export class PostsModule {}
