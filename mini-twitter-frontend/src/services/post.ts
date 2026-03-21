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

const BASE_URL = `${import.meta.env.VITE_API_URL}/posts`;

function getAuthHeaders() {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function getPosts(page = 1, search = "") {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/posts?page=${page}&search=${encodeURIComponent(search)}`,
  );

  if (!response.ok) {
    throw new Error("Erro ao buscar posts");
  }

  return response.json(); // deve retornar { posts: Post[], page, limit, total }
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
