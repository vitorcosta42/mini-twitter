import { db } from "../db";

export class AuthService {
  static register(name: string, email: string, password: string) {
    const query = db.prepare(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?) RETURNING id, name, email"
    );
    return query.get(name, email, password) as { id: number; name: string; email: string };
  }

  static login(email: string, password: string) {
    return db
      .prepare("SELECT * FROM users WHERE email = ? AND password = ?")
      .get(email, password) as any;
  }

  static blacklistToken(token: string, expiresAt: number) {
    // expiresAt vem do JWT (exp) em segundos
    const date = new Date(expiresAt * 1000).toISOString();
    db.prepare("INSERT OR IGNORE INTO tokens_blacklist (token, expiresAt) VALUES (?, ?)").run(token, date);
  }

  static isTokenBlacklisted(token: string) {
    const result = db.prepare("SELECT id FROM tokens_blacklist WHERE token = ?").get(token);
    return !!result;
  }
}
