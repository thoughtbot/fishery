import { Factory } from 'fishery';

export interface Factories {
  user: Factory<User>;
  post: Factory<Post>;
}

export interface User {
  id: string;
  name: string;
  post: Post | null;
}

export interface Post {
  id: number;
  title: string;
  user: User | null;
}
