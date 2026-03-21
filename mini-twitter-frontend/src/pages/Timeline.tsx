import { useEffect, useMemo, useRef, useState } from "react";
import { Heart, LogOut, Image as ImageIcon, Ellipsis } from "lucide-react";
import { useForm } from "react-hook-form";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import ThemeToggle from "../components/ThemeToggle";
import { useThemeStore } from "../stores/theme";
import { useAuthStore } from "../stores/authStore";
import { logoutUser } from "../services/auth";
import { Link } from "react-router-dom";
import {
  createPost,
  deletePost,
  getPosts,
  likePost,
  updatePost,
} from "../services/post";
import { ENV } from "../config/env";

export type Post = {
  id: number;
  title: string;
  content: string;
  image: string;
  authorName: string;
  createdAt: string;
  likesCount: number;
};

type CreatePostFormData = {
  title: string;
  content: string;
};

type EditPostFormData = {
  title: string;
  content: string;
};

export default function Timeline() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [image, setImage] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [openMenuPostId, setOpenMenuPostId] = useState<number | null>(null);
  const [editingPostId, setEditingPostId] = useState<number | null>(null);
  const [editImage, setEditImage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const editFileInputRef = useRef<HTMLInputElement | null>(null);

  const theme = useThemeStore((state) => state.theme);
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);

  const isAuthenticated = !!token;
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreatePostFormData>({
    defaultValues: {
      title: "",
      content: "",
    },
  });

  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
    formState: { errors: editErrors },
  } = useForm<EditPostFormData>({
    defaultValues: {
      title: "",
      content: "",
    },
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const {
    data,
    isLoading: loadingPosts,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["posts", searchTerm],
    queryFn: ({ pageParam = 1 }) => getPosts(pageParam, searchTerm),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const hasMore = lastPage.page * lastPage.limit < lastPage.total;
      return hasMore ? lastPage.page + 1 : undefined;
    },
  });

  const posts = useMemo(() => {
    return data?.pages.flatMap((page) => page.posts) ?? [];
  }, [data]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];

        if (firstEntry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      {
        threshold: 0.5,
      },
    );

    const currentRef = loadMoreRef.current;

    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const createPostMutation = useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      reset({
        title: "",
        content: "",
      });
      setImage(null);
      setPreview(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    onError: () => {
      setError("Não foi possível publicar o post.");
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: deletePost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      setOpenMenuPostId(null);
    },
    onError: () => {
      setError("Não foi possível deletar o post.");
    },
  });

  const likePostMutation = useMutation({
    mutationFn: likePost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: () => {
      setError("Não foi possível curtir o post.");
    },
  });

  const updatePostMutation = useMutation({
    mutationFn: ({
      postId,
      payload,
    }: {
      postId: number;
      payload: {
        title: string;
        content: string;
        image: string;
      };
    }) => updatePost(postId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      setEditingPostId(null);
      resetEdit({
        title: "",
        content: "",
      });
      setEditImage(null);
    },
    onError: () => {
      setError("Não foi possível atualizar o post.");
    },
  });

  const toggleMenu = (postId: number) => {
    setOpenMenuPostId((prev) => (prev === postId ? null : postId));
  };

  function handleSelectEditImage() {
    editFileInputRef.current?.click();
  }

  const handleEditPost = (postId: number) => {
    const postToEdit = posts.find((post) => post.id === postId);

    if (!postToEdit) return;

    setEditingPostId(postId);
    resetEdit({
      title: postToEdit.title || "",
      content: postToEdit.content || "",
    });
    setEditImage(postToEdit.image || null);
    setOpenMenuPostId(null);
  };

  const handleDeletePost = async (postId: number) => {
    setError("");
    deletePostMutation.mutate(postId);
  };

  const handleSaveEditPost = (data: EditPostFormData) => {
    if (editingPostId === null) return;

    setError("");
    updatePostMutation.mutate({
      postId: editingPostId,
      payload: {
        title: data.title,
        content: data.content,
        image: editImage || "",
      },
    });
  };

  function handleSelectImage() {
    fileInputRef.current?.click();
  }

  const formatDate = (date?: string) => {
    if (!date) return "";

    const dateOnly = date.slice(0, 10);
    const [year, month, day] = dateOnly.split("-");

    if (!year || !month || !day) return "";

    return `${day}/${month}/${year}`;
  };

  async function handleLogout() {
    try {
      await logoutUser();
    } catch (error) {
      console.error("Erro ao deslogar:", error);
    } finally {
      logout();
    }
  }

  function getImageUrl(image: string) {
    if (!image) return "";

    if (image.startsWith("data:") || image.startsWith("http")) {
      return image;
    }

    return `${ENV.API_URL}${image.startsWith("/") ? "" : "/"}${image}`;
  }

  const handleCancelEdit = () => {
    setEditingPostId(null);
    resetEdit({
      title: "",
      content: "",
    });
    setEditImage(null);
  };

  const onSubmitCreatePost = (data: CreatePostFormData) => {
    setError("");

    createPostMutation.mutate({
      title: data.title.trim(),
      content: data.content.trim(),
      image: image || undefined,
    });
  };

  const handleLikePost = (postId: number) => {
    setError("");
    likePostMutation.mutate(postId);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white-bg dark:bg-gradient-to-b dark:from-[#0F172B] dark:to-[#070B14] text-[#0D93F2] dark:text-white">
      <div className="border-b border-slate-200 dark:border-slate-500 px-4 sm:px-6 py-4 flex items-center justify-between flex-wrap gap-2">
        <h1 className="hidden sm:flex font-bold text-lg text-[#0D93F2] dark:text-white flex-shrink-0">
          Mini Twitter
        </h1>

        <input
          type="text"
          placeholder="Buscar por post..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 min-w-[150px] sm:max-w-md bg-white dark:bg-slate-800 
    text-black dark:text-white text-sm px-4 py-2 rounded-lg outline-none 
    placeholder:text-slate-500 dark:placeholder:text-slate-400"
        />

        <div className="flex items-center justify-end gap-2 flex-shrink-0 flex-wrap">
          {isAuthenticated && (
            <button
              onClick={handleLogout}
              aria-label="logout"
              className="p-2 font-bold dark:bg-gray-800 hover:bg-white-bg rounded-full border border-gray-300 
        dark:border-none dark:hover:bg-gray-600 transition"
            >
              <LogOut size={20} />
            </button>
          )}

          {!isAuthenticated && (
            <div className="flex items-center gap-2 flex-wrap justify-end">
              <Link to="/login?tab=register">
                <button
                  className="rounded-full px-4 py-2 font-bold border border-gray-300 hover:bg-gray-200 
            hover:text-black dark:border-slate-600 text-slate-600 
            dark:text-white dark:hover:bg-gray-800 dark:hover:text-white transition text-sm"
                >
                  Registrar-se
                </button>
              </Link>

              <Link to="/login?tab=login">
                <button
                  className="rounded-full font-bold bg-primary px-6 py-2 text-white
            hover:bg-primary-hover transition text-sm"
                >
                  Login
                </button>
              </Link>
            </div>
          )}

          <ThemeToggle />
        </div>
      </div>

      <div className="flex-1 w-full max-w-3xl mx-auto mt-4 sm:mt-6 px-4 sm:px-6 space-y-4 sm:space-y-6">
        {isAuthenticated && (
          <form
            onSubmit={handleSubmit(onSubmitCreatePost)}
            className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-300 dark:border-slate-700 shadow-xl"
          >
            <input
              type="text"
              placeholder="Título"
              {...register("title", {
                required: "O título é obrigatório",
              })}
              className="w-full bg-transparent outline-none text-base sm:text-lg font-bold placeholder:text-slate-400 text-black dark:text-white mb-3"
            />

            {errors.title && (
              <p className="text-sm text-red-500 mb-2">
                {errors.title.message}
              </p>
            )}

            <textarea
              placeholder="E aí, o que está rolando?"
              {...register("content", {
                required: "O conteúdo é obrigatório",
              })}
              className="w-full bg-transparent outline-none resize-none placeholder:text-slate-400 text-black dark:text-white text-sm sm:text-base"
            />

            {errors.content && (
              <p className="text-sm text-red-500 mt-2">
                {errors.content.message}
              </p>
            )}

            {preview && (
              <div className="mt-3 relative">
                <img
                  src={preview}
                  alt="preview"
                  className="w-full max-h-60 object-cover rounded-lg"
                />

                <button
                  type="button"
                  onClick={() => {
                    setImage(null);
                    setPreview(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = "";
                    }
                  }}
                  className="absolute top-2 right-2 bg-black/60 text-white font-bold text-xs px-2 py-1 rounded"
                >
                  X
                </button>
              </div>
            )}

            <div className="flex justify-between items-start mt-4 border-t border-slate-200 dark:border-slate-600 pt-2">
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];

                  if (file) {
                    const reader = new FileReader();

                    reader.onloadend = () => {
                      const base64String = reader.result as string;
                      setImage(base64String);
                      setPreview(base64String);
                    };

                    reader.readAsDataURL(file);
                  }
                }}
              />

              <ImageIcon
                onClick={handleSelectImage}
                className="text-[#0D93F2] cursor-pointer rounded-full hover:text-blue-500 transition shrink-0"
                size={24}
              />

              <button
                type="submit"
                disabled={createPostMutation.isPending}
                className="bg-[#0D93F2] px-6 sm:px-8 py-2 rounded-full text-white text-sm font-bold hover:opacity-90 disabled:opacity-60"
              >
                {createPostMutation.isPending ? "Postando..." : "Postar"}
              </button>
            </div>
          </form>
        )}

        {(error || isError) && (
          <div className="bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-300 p-3 rounded-lg border border-red-300 dark:border-red-800">
            {error || "Não foi possível carregar os posts."}
          </div>
        )}

        {loadingPosts ? (
          <div className="bg-white p-4 rounded-xl border border-slate-100 dark:bg-slate-800 dark:border-slate-600">
            <p className="text-black dark:text-white">Carregando posts...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white p-4 rounded-xl border border-slate-100 dark:bg-slate-800 dark:border-slate-600">
            <p className="text-black dark:text-white">
              Nenhum post encontrado.
            </p>
          </div>
        ) : (
          posts.map((post) => (
            <div
              key={post.id}
              className="bg-white p-3 sm:p-4 rounded-xl border border-slate-100 dark:bg-slate-800 dark:border dark:border-slate-600"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2 text-sm min-w-0">
                  <span className="font-bold text-black dark:text-white break-words">
                    {post.authorName}
                  </span>
                  <span className="text-slate-400 text-sm break-words">
                    @{post.authorName}
                  </span>
                  <span className="text-slate-500 text-sm">
                    · {formatDate(post.createdAt)}
                  </span>
                </div>

                <div className="relative shrink-0">
                  <button
                    type="button"
                    aria-label="menu"
                    onClick={() => toggleMenu(post.id)}
                    className="hover:cursor-pointer hover:text-[#0D93F2] hover:bg-primary/10 rounded-full p-1 text-slate-400 dark:text-slate-400 dark:hover:text-white transition"
                  >
                    <Ellipsis />
                  </button>

                  {openMenuPostId === post.id && (
                    <div className="absolute right-0 w-36 rounded-lg border border-slate-200 bg-white shadow-lg z-50 dark:bg-slate-900 dark:border-slate-700">
                      <button
                        type="button"
                        onClick={() => handleEditPost(post.id)}
                        className="w-full font-semibold text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-white dark:hover:bg-slate-800 rounded-t-lg"
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeletePost(post.id)}
                        className="w-full font-semibold text-left px-4 py-2 text-sm text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-b-lg"
                      >
                        Deletar
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {editingPostId === post.id ? (
                <form
                  onSubmit={handleSubmitEdit(handleSaveEditPost)}
                  className="mt-3 space-y-3"
                >
                  <input
                    type="text"
                    placeholder="Título"
                    {...registerEdit("title", {
                      required: "O título é obrigatório",
                    })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-black dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                  />

                  {editErrors.title && (
                    <p className="text-sm text-red-500">
                      {editErrors.title.message}
                    </p>
                  )}

                  <textarea
                    placeholder="Conteúdo"
                    rows={4}
                    {...registerEdit("content", {
                      required: "O conteúdo é obrigatório",
                    })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-black dark:bg-slate-900 dark:border-slate-700 dark:text-white resize-none"
                  />

                  {editErrors.content && (
                    <p className="text-sm text-red-500">
                      {editErrors.content.message}
                    </p>
                  )}

                  {editImage && (
                    <div className="mt-3 relative">
                      <img
                        src={getImageUrl(editImage)}
                        alt="Imagem do post"
                        className="w-full max-h-96 object-cover rounded-lg"
                      />

                      <button
                        type="button"
                        onClick={() => {
                          setEditImage(null);
                          if (editFileInputRef.current) {
                            editFileInputRef.current.value = "";
                          }
                        }}
                        className="absolute top-2 right-2 bg-black/60 text-white font-bold text-xs px-2 py-1 rounded"
                      >
                        X
                      </button>
                    </div>
                  )}

                  <input
                    type="file"
                    accept="image/*"
                    ref={editFileInputRef}
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];

                      if (file) {
                        const reader = new FileReader();

                        reader.onloadend = () => {
                          const base64String = reader.result as string;
                          setEditImage(base64String);
                        };

                        reader.readAsDataURL(file);
                      }
                    }}
                  />

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleSelectEditImage}
                      className="px-4 py-2 rounded-lg bg-slate-200 text-black hover:bg-slate-300 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600"
                    >
                      {editImage ? "Trocar imagem" : "Adicionar imagem"}
                    </button>
                  </div>

                  <div className="flex gap-2 justify-end flex-wrap">
                    <button
                      type="submit"
                      disabled={updatePostMutation.isPending}
                      className="px-4 py-2 rounded-lg bg-[#0D93F2] text-white hover:opacity-90 disabled:opacity-60"
                    >
                      {updatePostMutation.isPending ? "Salvando..." : "Salvar"}
                    </button>

                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="px-4 py-2 rounded-lg bg-slate-200 text-black hover:bg-slate-300 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  {post.title && (
                    <h2 className="mt-2 font-bold text-black dark:text-white text-base sm:text-lg break-words">
                      {post.title}
                    </h2>
                  )}

                  <p className="mt-2 text-black dark:text-slate-200 text-sm sm:text-base break-words">
                    {post.content}
                  </p>

                  {post.image && (
                    <div className="mt-3">
                      <img
                        src={getImageUrl(post.image)}
                        alt={post.title || "Imagem do post"}
                        className="w-full max-h-96 object-cover rounded-lg"
                      />
                    </div>
                  )}
                </>
              )}

              <div className="mt-3">
                <Heart
                  size={16}
                  data-testid="heart-icon"
                  aria-label="like"
                  onClick={() => handleLikePost(post.id)}
                  fill={post.likesCount ? "currentColor" : "none"}
                  className={`cursor-pointer transition ${
                    post.likesCount
                      ? "text-red-500"
                      : "text-slate-400 hover:text-red-500"
                  }`}
                />
              </div>
            </div>
          ))
        )}
        <div ref={loadMoreRef} className="h-10" />

        {isFetchingNextPage && (
          <div className="bg-white p-4 rounded-xl border border-slate-100 dark:bg-slate-800 dark:border-slate-600">
            <p className="text-black dark:text-white">
              Carregando mais posts...
            </p>
          </div>
        )}
      </div>

      <footer className="px-4 sm:px-8 py-3 text-base sm:text-lg font-bold text-primary dark:bg-[#0F172B] dark:text-white">
        Mini Twitter
      </footer>
    </div>
  );
}
