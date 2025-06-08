import {
  Entity,
  PrimaryKey,
  Property,
  ManyToOne,
  Collection,
  OneToMany,
} from '@mikro-orm/core';
import { User } from './user.entity';
import { Comment } from './comment.entity';

@Entity()
export class Post {
  @PrimaryKey()
  id!: number;

  @Property()
  title!: string;

  @Property({ type: 'text' })
  content!: string;

  @Property()
  createdAt: Date = new Date();

  @ManyToOne(() => User)
  user!: User;

  @OneToMany(() => Comment, (comment) => comment.post)
  comments = new Collection<Comment>(this);
}
