export default function PostCard({ post }: any) {
  return (
    <div className="border p-4 mb-4">
      <h3>{post.title}</h3>

      <p>{post.content}</p>

      {post.image && <img src={post.image} />}

      <small>{post.author.name}</small>

      <div>❤️ {post.likesCount}</div>
    </div>
  );
}
