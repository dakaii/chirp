import {
  Entity,
  PrimaryKey,
  Property,
  Collection,
  OneToMany,
} from '@mikro-orm/core';
import { Post } from './post.entity';
import { Comment } from './comment.entity';

@Entity()
export class User {
  @PrimaryKey()
  id!: number;

  @Property()
  username!: string;

  @Property({ unique: true })
  email!: string;

  @Property()
  password!: string;

  @OneToMany(() => Post, (post) => post.user)
  posts = new Collection<Post>(this);

  @OneToMany(() => Comment, (comment) => comment.user)
  comments = new Collection<Comment>(this);
}
