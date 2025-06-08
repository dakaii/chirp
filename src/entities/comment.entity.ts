import { Entity, PrimaryKey, Property, ManyToOne } from '@mikro-orm/core';
import { Post } from './post.entity';
import { User } from './user.entity';

@Entity()
export class Comment {
  @PrimaryKey()
  id!: number;

  @Property({ type: 'text' })
  content!: string;

  @Property({ onCreate: () => new Date() })
  createdAt!: Date;

  @ManyToOne(() => Post)
  post!: Post;

  @ManyToOne(() => User)
  user!: User;
}
