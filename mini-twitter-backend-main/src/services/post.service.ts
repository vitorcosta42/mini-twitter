import { db } from "../db";

export class PostService {
  static getAll(page: number = 1, limit: number = 10, search?: string) {

    const queryPage = isNaN(page) ? 1 : page;

    const offset = (queryPage - 1) * limit;
    let queryStr = `
      SELECT p.*, u.name as authorName, 
      (SELECT COUNT(*) FROM likes WHERE postId = p.id) as likesCount
      FROM posts p 
      JOIN users u ON p.authorId = u.id 
    `;
    
    const params: any[] = [];
    if (search) {
      queryStr += ` WHERE p.title LIKE ? `;
      params.push(`%${search}%`);
    }
    
    queryStr += ` ORDER BY p.createdAt DESC LIMIT ? OFFSET ? `;
    params.push(limit, offset);

    const posts = db.prepare(queryStr).all(...params);
    
    // Total para paginação
    let countQuery = "SELECT COUNT(*) as total FROM posts p";
    if (search) {
      countQuery += " WHERE p.title LIKE ?";
      const total = (db.prepare(countQuery).get(`%${search}%`) as any).total;
      return { posts, total, page: queryPage, limit };
    }
    
    const total = (db.prepare(countQuery).get() as any).total;
    return { posts, total, page: queryPage, limit };
  }

  static create(title: string, content: string, authorId: string, image?: string) {
    const query = db.prepare(
      "INSERT INTO posts (title, content, authorId, image) VALUES (?, ?, ?, ?) RETURNING *"
    );
    return query.get(title, content, authorId, image ?? null);
  }

  static getById(id: number) {
    return db.prepare("SELECT * FROM posts WHERE id = ?").get(id) as any;
  }

  static update(id: number, title: string, content: string, image?: string) {
    db.prepare("UPDATE posts SET title = ?, content = ?, image = ? WHERE id = ?").run(title, content, image ?? null, id);
    return { success: true };
  }

  static delete(id: number) {
    db.prepare("DELETE FROM posts WHERE id = ?").run(id);
    return { success: true };
  }

  static toggleLike(postId: number, userId: number) {
    const existingLike = db.prepare("SELECT id FROM likes WHERE postId = ? AND userId = ?").get(postId, userId);
    
    if (existingLike) {
      db.prepare("DELETE FROM likes WHERE postId = ? AND userId = ?").run(postId, userId);
      return { liked: false };
    } else {
      db.prepare("INSERT INTO likes (postId, userId) VALUES (?, ?)").run(postId, userId);
      return { liked: true };
    }
  }
}
