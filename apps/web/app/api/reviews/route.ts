import { NextResponse } from "next/server";
import { db, reviews } from "@skill-loop/db";
import { getCurrentUser } from "../../_lib/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const form = await request.formData();
  const bookingId = String(form.get("bookingId") ?? "");
  const rating = Number(form.get("rating") ?? 5);
  const comment = String(form.get("comment") ?? "Great practical session.");
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url), 303);
  }

  if (user.role !== "learner" && user.role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard/mentor?review=learner-only", request.url), 303);
  }

  if (!process.env.POSTGRES_URL) {
    return NextResponse.redirect(new URL(`/dashboard/learner?reviewed=${bookingId}&mode=seed-demo`, request.url), 303);
  }

  await db.insert(reviews).values({
    bookingId,
    reviewerId: user.id,
    mentorId: "00000000-0000-0000-0000-000000000003",
    rating,
    comment
  });

  return NextResponse.redirect(new URL(`/dashboard/learner?reviewed=${bookingId}`, request.url), 303);
}
