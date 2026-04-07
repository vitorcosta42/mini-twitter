import { api } from "./api";

export type Post = {
  id: number;
  title: string;
  content: string;
  image: string;
  authorName: string;
  createdAt: string;
  likesCount: number;
};

export type CreatePostData = {
  title: string;
  content: string;
  image?: string;
};

export type UpdatePostData = {
  title: string;
  content: string;
  image: string;
};

export async function getPosts(page = 1, search = "") {
  const response = await api.get("/posts", {
    params: {
      page,
      search,
    },
  });

  return response.data;
}

export async function createPost(data: CreatePostData): Promise<Post> {
  const response = await api.post("/posts", data);
  return response.data;
}

export async function updatePost(
  id: number,
  data: UpdatePostData,
): Promise<Post> {
  const response = await api.put(`/posts/${id}`, data);
  return response.data;
}

export async function deletePost(id: number): Promise<void> {
  await api.delete(`/posts/${id}`);
}

export async function likePost(id: number): Promise<void> {
  await api.post(`/posts/${id}/like`);
}
