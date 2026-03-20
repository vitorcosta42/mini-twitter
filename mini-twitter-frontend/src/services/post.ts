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

type GetPostsResponse = {
  posts: Post[];
  total: number;
  page: number;
  limit: number;
};

export type UpdatePostData = {
  title: string;
  content: string;
  image: string;
};

const BASE_URL = "http://localhost:3000/posts";

function getAuthHeaders() {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function getPosts(): Promise<Post[]> {
  const response = await fetch(BASE_URL, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Erro ao buscar posts");
  }

  const data: GetPostsResponse = await response.json();
  return data.posts;
}

export async function createPost(data: CreatePostData): Promise<Post> {
  const response = await fetch(BASE_URL, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Erro ao criar post");
  }

  return response.json();
}

export async function updatePost(
  id: number,
  data: UpdatePostData,
): Promise<Post> {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Erro ao atualizar post");
  }

  return response.json();
}

export async function deletePost(id: number): Promise<void> {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Erro ao deletar post");
  }
}

export async function likePost(id: number): Promise<void> {
  const response = await fetch(`${BASE_URL}/${id}/like`, {
    method: "POST",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Erro ao curtir post");
  }
}
