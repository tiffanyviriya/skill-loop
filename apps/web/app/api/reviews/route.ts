import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db, reviews, bookings } from "@skill-loop/db";
import { getCurrentUser } from "../../_lib/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const form = await request.formData();
  const bookingId = String(form.get("bookingId") ?? "");
  const rawRating = Number(form.get("rating") ?? 5);
  // Clamp to a valid 1–5 integer; default to 5 for non-numeric input.
  const rating = Number.isFinite(rawRating)
    ? Math.min(5, Math.max(1, Math.round(rawRating)))
    : 5;
  const comment = String(form.get("comment") ?? "").trim();
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

  const [booking] = await db
    .select()
    .from(bookings)
    .where(eq(bookings.id, bookingId))
    .limit(1);

  if (!booking) {
    return NextResponse.redirect(new URL("/dashboard/learner?review=not-found", request.url), 303);
  }

  if (booking.learnerId !== user.id) {
    return NextResponse.redirect(new URL("/dashboard/learner?review=not-yours", request.url), 303);
  }

  if (booking.status !== "completed") {
    return NextResponse.redirect(new URL("/dashboard/learner?review=not-completed", request.url), 303);
  }

  // One review per booking — guard against duplicate submissions.
  const [existingReview] = await db
    .select({ id: reviews.id })
    .from(reviews)
    .where(eq(reviews.bookingId, bookingId))
    .limit(1);

  if (existingReview) {
    return NextResponse.redirect(new URL("/dashboard/learner?review=already-reviewed", request.url), 303);
  }

  try {
    await db.insert(reviews).values({
      bookingId,
      reviewerId: user.id,
      mentorId: booking.mentorId,
      rating,
      comment: comment || "Great practical session.",
    });
  } catch {
    // Unique constraint race — treat as already reviewed.
    return NextResponse.redirect(new URL("/dashboard/learner?review=already-reviewed", request.url), 303);
  }

  return NextResponse.redirect(new URL(`/dashboard/learner?reviewed=${bookingId}`, request.url), 303);
}
