import { NextResponse } from "next/server";
import { db, users } from "@skill-loop/db";
import type { UserRole } from "@skill-loop/domain";
import { hashPassword } from "../../../_lib/password";

export const runtime = "nodejs";

const roles = new Set(["learner", "mentor", "business"]);

export async function POST(request: Request) {
  const form = await request.formData();
  const name = String(form.get("name") ?? "").trim();
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  const roleInput = String(form.get("role") ?? "learner");
  const role = (roles.has(roleInput) ? roleInput : "learner") as UserRole;

  if (!name || !email || password.length < 8) {
    return NextResponse.redirect(new URL("/register?error=invalid", request.url), 303);
  }

  if (!process.env.POSTGRES_URL) {
    return NextResponse.redirect(new URL("/login?registered=seed-demo", request.url), 303);
  }

  try {
    await db.insert(users).values({
      name,
      email,
      passwordHash: hashPassword(password),
      role,
      tokenBalance: role === "business" ? 300 : 100,
      trustScore: 50
    });
  } catch (error) {
    const message = error instanceof Error ? error.message.toLowerCase() : "";

    if (message.includes("duplicate") || message.includes("unique")) {
      return NextResponse.redirect(new URL("/register?error=exists", request.url), 303);
    }

    return NextResponse.redirect(new URL("/register?error=server", request.url), 303);
  }

  return NextResponse.redirect(new URL("/login?registered=1", request.url), 303);
}
