import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { User } from '../entities/user.entity';
import { UsersController } from '../controllers/users.controller';
import { UsersService } from '../services/users.service';
import { CommentsModule } from './comments.module';

@Module({
  imports: [MikroOrmModule.forFeature([User]), CommentsModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
