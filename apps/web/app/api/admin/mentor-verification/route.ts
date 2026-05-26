import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db, users } from "@skill-loop/db";
import { getCurrentUser } from "../../../_lib/auth";

export const runtime = "nodejs";

// trustScore >= 90 = verified, else community
const VERIFIED_THRESHOLD = 90;
const VERIFIED_SCORE = 95;
const COMMUNITY_SCORE = 60;

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

  const [mentor] = await db
    .select({ trustScore: users.trustScore })
    .from(users)
    .where(eq(users.id, mentorId))
    .limit(1);

  if (!mentor) {
    return NextResponse.redirect(new URL("/admin?error=mentor-not-found", request.url), 303);
  }

  const newScore = mentor.trustScore >= VERIFIED_THRESHOLD ? COMMUNITY_SCORE : VERIFIED_SCORE;

  await db.update(users)
    .set({ trustScore: newScore })
    .where(eq(users.id, mentorId));

  return NextResponse.redirect(new URL(`/admin?verified=${mentorId}`, request.url), 303);
}
