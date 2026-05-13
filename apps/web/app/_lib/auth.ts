import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, users } from "@skill-loop/db";
import { seedUsers, type UserRole } from "@skill-loop/domain";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  tokenBalance: number;
  trustScore: number;
};

export const SESSION_COOKIE = "skill_loop_session";

export async function getCurrentUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const userId = cookieStore.get(SESSION_COOKIE)?.value;

  if (!userId) {
    return null;
  }

  if (!process.env.POSTGRES_URL) {
    const seedUser = seedUsers.find((user) => user.id === userId);

    if (!seedUser) {
      return null;
    }

    return {
      id: seedUser.id,
      name: seedUser.name,
      email: seedUser.email,
      role: seedUser.role,
      tokenBalance: seedUser.tokenBalance,
      trustScore: seedUser.trustScore
    };
  }

  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      tokenBalance: users.tokenBalance,
      trustScore: users.trustScore
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return user ?? null;
}

export async function requireUser(allowedRoles?: UserRole[]) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    redirect(roleHomePath(user.role));
  }

  return user;
}

export function roleHomePath(role: UserRole) {
  if (role === "mentor") {
    return "/dashboard/mentor";
  }

  if (role === "business") {
    return "/projects";
  }

  if (role === "admin") {
    return "/admin";
  }

  return "/dashboard/learner";
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14
  };
}
