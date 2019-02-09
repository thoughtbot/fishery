import { Factory } from '../../factory';

export interface Factories {
  user: Factory<User>;
  post: Factory<Post>;
}

export interface User {
  id: string;
  name: string;
  post: Post;
}

export interface Post {
  id: number;
  title: string;
  user?: User;
}
