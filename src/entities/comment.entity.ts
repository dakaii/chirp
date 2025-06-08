import { Entity, PrimaryKey, Property, ManyToOne } from '@mikro-orm/core';
import { Post } from './post.entity';
import { User } from './user.entity';

@Entity()
export class Comment {
  @PrimaryKey()
  id!: number;

  @Property()
  content!: string;

  @Property()
  createdAt: Date = new Date();

  @ManyToOne(() => Post)
  post!: Post;

  @ManyToOne(() => User)
  user!: User;
}
