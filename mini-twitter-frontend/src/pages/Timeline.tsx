import { useEffect, useRef, useState } from "react";
import { Heart, LogOut, Image as ImageIcon, Ellipsis } from "lucide-react";
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

export type Post = {
  id: number;
  title: string;
  content: string;
  image: string;
  authorName: string;
  createdAt: string;
  likesCount: number;
};

export default function Timeline() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [image, setImage] = useState<string | null>(null);

  const [preview, setPreview] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");
  const [openMenuPostId, setOpenMenuPostId] = useState<number | null>(null);
  const [editingPostId, setEditingPostId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editImage, setEditImage] = useState<string | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const theme = useThemeStore((state) => state.theme);
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);

  const isAuthenticated = !!token;

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  useEffect(() => {
    fetchPosts();
  }, []);

  const toggleMenu = (postId: number) => {
    setOpenMenuPostId((prev) => (prev === postId ? null : postId));
  };

  const handleEditPost = (postId: number) => {
    const postToEdit = posts.find((post) => post.id === postId);

    if (!postToEdit) return;

    setEditingPostId(postId);
    setEditTitle(postToEdit.title || "");
    setEditContent(postToEdit.content || "");
    setEditImage(postToEdit.image || null);
    setOpenMenuPostId(null);
  };

  const handleDeletePost = async (postId: number) => {
    try {
      await deletePost(postId);
      setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
      setOpenMenuPostId(null);
    } catch (error) {
      console.error("Erro ao deletar post:", error);
      setError("Não foi possível deletar o post.");
    }
  };

  const handleSaveEditPost = async () => {
    if (editingPostId === null) return;

    try {
      setSavingEdit(true);

      await updatePost(editingPostId, {
        title: editTitle,
        content: editContent,
        image: editImage || "",
      });

      await fetchPosts();

      setEditingPostId(null);
      setEditTitle("");
      setEditContent("");
      setEditImage(null);
    } catch (error) {
      console.error("Erro ao atualizar post:", error);
      setError("Não foi possível atualizar o post.");
    } finally {
      setSavingEdit(false);
    }
  };

  async function fetchPosts() {
    try {
      setLoadingPosts(true);
      setError("");
      const data = await getPosts();
      console.log("POSTS DA API:", data);
      setPosts(data);
    } catch (error) {
      console.error("Erro ao buscar posts:", error);
      setError("Não foi possível carregar os posts.");
    } finally {
      setLoadingPosts(false);
    }
  }

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

    return `http://localhost:3000${image.startsWith("/") ? "" : "/"}${image}`;
  }

  const handleCancelEdit = () => {
    setEditingPostId(null);
    setEditTitle("");
    setEditContent("");
    setEditImage(null);
  };

  async function handleCreatePost() {
    if (!title.trim() || !content.trim()) {
      setError("Preencha o título e o conteúdo do post.");
      return;
    }

    try {
      setPosting(true);
      setError("");

      await createPost({
        title: title.trim(),
        content: content.trim(),
        image: image || undefined,
      });

      setTitle("");
      setContent("");
      setImage(null);
      setPreview(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      await fetchPosts();
    } catch (error) {
      console.error("Erro ao criar post:", error);
      setError("Não foi possível publicar o post.");
    } finally {
      setPosting(false);
    }
  }

  async function handleLikePost(postId: number) {
    try {
      await likePost(postId);
      await fetchPosts();
    } catch (error) {
      console.error("Erro ao curtir post:", error);
      setError("Não foi possível curtir o post.");
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-white-bg dark:bg-gradient-to-b dark:from-[#0F172B] dark:to-[#070B14] text-[#0D93F2] dark:text-white">
      <div className="border-b border-slate-200 dark:border-slate-500 px-6 py-4 flex justify-between items-center">
        <h1 className="font-bold text-lg text-[#0D93F2] dark:text-white">
          Mini Twitter
        </h1>

        <input
          type="text"
          placeholder="Buscar por post..."
          className="bg-white dark:bg-slate-800 
          text-black dark:text-white 
          text-sm 
          px-4 py-2 rounded-lg outline-none 
          placeholder:text-slate-500 
          dark:placeholder:text-slate-400 
          w-1/2"
        />

        <div className="flex items-center gap-2">
          {isAuthenticated && (
            <button
              onClick={handleLogout}
              className="p-2 font-bold dark:bg-gray-800 hover:bg-white-bg rounded-full border border-gray-300 
              dark:border-none 
              dark:hover:bg-gray-600 transition"
            >
              <LogOut size={20} />
            </button>
          )}

          {!isAuthenticated && (
            <div className="flex items-center gap-2">
              <Link to="/login?tab=register">
                <button
                  className="rounded-full px-6 py-2 font-bold border border-gray-300 hover:bg-gray-200 
                  hover:text-black dark:border-slate-600 text-slate-600 
                  dark:text-white dark:hover:bg-gray-800 dark:hover:text-white transition"
                >
                  Registrar-se
                </button>
              </Link>

              <Link to="/login?tab=login">
                <button
                  className="rounded-full font-bold bg-primary px-14 py-2 text-white
                  hover:bg-primary-hover transition"
                >
                  Login
                </button>
              </Link>
            </div>
          )}

          <ThemeToggle />
        </div>
      </div>

      <div className="flex-1 w-[60%] mx-auto mt-6 space-y-6">
        {isAuthenticated && (
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-300 dark:border-slate-700 shadow-xl">
            <input
              type="text"
              placeholder="Título"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-transparent outline-none text-lg font-bold
    placeholder:text-slate-400 text-black dark:text-white mb-3"
            />

            <textarea
              placeholder="E aí, o que está rolando?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-transparent outline-none resize-none placeholder:text-slate-400 text-black dark:text-white"
            />
            {preview && (
              <div className="mt-3 relative">
                <img
                  src={preview}
                  alt="preview"
                  className="w-full max-h-60 object-cover rounded-lg"
                />

                <button
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

                    // Esta função dispara quando a leitura termina
                    reader.onloadend = () => {
                      const base64String = reader.result as string;
                      setImage(base64String); // Agora o estado recebe a String
                      setPreview(base64String); // O preview usa a mesma string Base64
                    };

                    // Inicia a leitura do arquivo como uma URL de dados (Base64)
                    reader.readAsDataURL(file);
                  }
                }}
              />

              <ImageIcon
                onClick={handleSelectImage}
                className="text-[#0D93F2] cursor-pointer rounded-full hover:text-blue-500 transition"
                size={24}
              />

              <button
                onClick={handleCreatePost}
                disabled={posting}
                className="bg-[#0D93F2] px-8 py-2 rounded-full text-white text-sm font-bold hover:opacity-90 disabled:opacity-60"
              >
                {posting ? "Postando..." : "Postar"}
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-300 p-3 rounded-lg border border-red-300 dark:border-red-800">
            {error}
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
              className="bg-white p-4 rounded-xl border border-slate-100 dark:bg-slate-800 dark:border dark:border-slate-600"
            >
              <div className="flex items-center text-md justify-between">
                <div className="flex items-center gap-2 text-md">
                  <span className="font-bold text-black dark:text-white">
                    {post.authorName}
                  </span>
                  <span className="text-slate-400 text-sm">
                    @{post.authorName}
                  </span>
                  <span className="text-slate-500 text-sm">
                    · {formatDate(post.createdAt)}
                  </span>
                </div>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => toggleMenu(post.id)}
                    className="hover:cursor-pointer hover:text-[#0D93F2] hover:bg-primary/10 rounded-full p-1 text-slate-400 dark:text-slate-400 dark:hover:text-white transition"
                  >
                    <Ellipsis />
                  </button>

                  {openMenuPostId === post.id && (
                    <div className="absolute right-0  w-36 rounded-lg border border-slate-200 bg-white shadow-lg z-50 dark:bg-slate-900 dark:border-slate-700">
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
                <div className="mt-3 space-y-3">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="Título"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-black dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                  />

                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    placeholder="Conteúdo"
                    rows={4}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-black dark:bg-slate-900 dark:border-slate-700 dark:text-white resize-none"
                  />

                  {editImage && (
                    <div>
                      <img
                        src={getImageUrl(editImage)}
                        alt={editTitle || "Imagem do post"}
                        className="w-full max-h-96 object-cover rounded-lg"
                      />
                    </div>
                  )}

                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={handleSaveEditPost}
                      disabled={savingEdit}
                      className="px-4 py-2 rounded-lg bg-[#0D93F2] text-white hover:opacity-90 disabled:opacity-60"
                    >
                      {savingEdit ? "Salvando..." : "Salvar"}
                    </button>

                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="px-4 py-2 rounded-lg bg-slate-200 text-black hover:bg-slate-300 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {post.title && (
                    <h2 className="mt-2 font-bold text-black dark:text-white text-lg ">
                      {post.title}
                    </h2>
                  )}

                  <p className="mt-2 text-black dark:text-slate-200 text-md">
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

        <div className="flex justify-center gap-8 text-sm text-slate-400 pt-4 pb-10">
          <button>{"<"}</button>
          <button className="bg-[#0D93F2] text-white px-3 py-1 rounded-full font-medium">
            1
          </button>
          <button className="font-medium">2</button>
          <button className="font-medium">3</button>
          <button className="font-medium">{">"}</button>
        </div>
      </div>

      <footer className="px-8 py-3 text-lg font-bold text-primary dark:bg-[#0F172B] dark:text-white">
        Mini Twitter
      </footer>
    </div>
  );
}
