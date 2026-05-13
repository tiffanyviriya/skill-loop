import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db, users } from "@skill-loop/db";
import { seedUsers } from "@skill-loop/domain";
import { roleHomePath, SESSION_COOKIE, sessionCookieOptions } from "../../../_lib/auth";
import { verifyPassword } from "../../../_lib/password";

export const runtime = "nodejs";

export function GET(request: Request) {
  return NextResponse.redirect(new URL("/login", request.url), 303);
}

export async function POST(request: Request) {
  const form = await request.formData();
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");

  if (!email || !password) {
    return NextResponse.redirect(new URL("/login?error=missing", request.url), 303);
  }

  if (!process.env.POSTGRES_URL) {
    const demoUser = seedUsers.find((user) => user.email === email && user.demoPassword === password);

    if (!demoUser) {
      return NextResponse.redirect(new URL("/login?error=invalid", request.url), 303);
    }

    const response = NextResponse.redirect(new URL(roleHomePath(demoUser.role), request.url), 303);
    response.cookies.set(SESSION_COOKIE, demoUser.id, sessionCookieOptions());

    return response;
  }

  let user:
    | {
        id: string;
        role: "learner" | "mentor" | "business" | "admin";
        passwordHash: string | null;
      }
    | undefined;

  try {
    [user] = await db
      .select({
        id: users.id,
        role: users.role,
        passwordHash: users.passwordHash
      })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
  } catch {
    const demoUser = seedUsers.find((seedUser) => seedUser.email === email && seedUser.demoPassword === password);

    if (demoUser) {
      const response = NextResponse.redirect(new URL(roleHomePath(demoUser.role), request.url), 303);
      response.cookies.set(SESSION_COOKIE, demoUser.id, sessionCookieOptions());

      return response;
    }

    return NextResponse.redirect(new URL("/login?error=server", request.url), 303);
  }

  if (!user?.passwordHash || !verifyPassword(password, user.passwordHash)) {
    return NextResponse.redirect(new URL("/login?error=invalid", request.url), 303);
  }

  const response = NextResponse.redirect(new URL(roleHomePath(user.role), request.url), 303);
  response.cookies.set(SESSION_COOKIE, user.id, sessionCookieOptions());

  return response;
}
