export interface User {
  id: string;
  created: boolean;
  name: string;
  posts: Post[];
}

export interface Post {
  id: number;
  title: string;
  user: User | null;
  createdAt: Date;
}
