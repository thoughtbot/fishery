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
