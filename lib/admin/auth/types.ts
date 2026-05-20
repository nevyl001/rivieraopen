export interface AdminCredentials {
  username: string;
  password: string;
}

export interface AdminSession {
  id: string;
  userId: string;
  expiresAt: Date;
}

export interface AdminUser {
  id: string;
  username: string;
  role: "admin" | "super_admin";
  createdAt: Date;
}

export interface AuthResult {
  authenticated: boolean;
  user?: AdminUser;
}
