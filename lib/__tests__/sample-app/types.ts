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
