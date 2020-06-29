export interface User {
  id: string;
  name: string;
  posts: Post[];
}

export interface Post {
  id: number;
  title: string;
  user: User | null;
}
