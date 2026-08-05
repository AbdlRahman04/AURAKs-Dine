import type { User } from "@shared/schema";

/** Public user shape returned by API responses (never includes password hash). */
export type SafeUser = Omit<User, "password">;

export function sanitizeUser(user: User): SafeUser {
  const { password: _password, ...safe } = user;
  return safe;
}

export function sanitizeUsers(users: User[]): SafeUser[] {
  return users.map(sanitizeUser);
}
