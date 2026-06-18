import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db, users } from "@skill-loop/db";
import { getCurrentUser } from "../../../_lib/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const form = await request.formData();
  const mentorId = String(form.get("mentorId") ?? "");
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url), 303);
  }

  if (user.role !== "admin") {
    return NextResponse.redirect(new URL("/admin?error=admin-only", request.url), 303);
  }

  if (!process.env.POSTGRES_URL) {
    return NextResponse.redirect(new URL(`/admin?verified=${mentorId}&mode=seed-demo`, request.url), 303);
  }

  // Toggle the verified flag without touching the earned trust score.
  const [mentor] = await db
    .select({ verified: users.verified })
    .from(users)
    .where(and(eq(users.id, mentorId), eq(users.role, "mentor")))
    .limit(1);

  if (!mentor) {
    return NextResponse.redirect(new URL("/admin?error=mentor-not-found", request.url), 303);
  }

  await db.update(users)
    .set({ verified: !mentor.verified })
    .where(eq(users.id, mentorId));

  return NextResponse.redirect(new URL(`/admin?verified=${mentorId}`, request.url), 303);
}
