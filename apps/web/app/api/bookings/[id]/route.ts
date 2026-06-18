import { NextResponse } from "next/server";
import { and, eq, sql } from "drizzle-orm";
import { db, bookings, users, walletTransactions } from "@skill-loop/db";
import { getCurrentUser } from "../../../_lib/auth";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: bookingId } = await params;
  const form = await request.formData();
  const action = String(form.get("action") ?? "");
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url), 303);
  }

  if (!process.env.POSTGRES_URL) {
    const dest = action === "complete" ? "/dashboard/mentor?mode=seed-demo" : "/dashboard/learner?mode=seed-demo";
    return NextResponse.redirect(new URL(dest, request.url), 303);
  }

  const [booking] = await db
    .select()
    .from(bookings)
    .where(eq(bookings.id, bookingId))
    .limit(1);

  if (!booking) {
    return NextResponse.redirect(new URL("/dashboard/learner?error=not-found", request.url), 303);
  }

  if (action === "cancel") {
    if (booking.learnerId !== user.id && user.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard/learner?error=not-yours", request.url), 303);
    }
    if (booking.status !== "pending") {
      return NextResponse.redirect(new URL("/dashboard/learner?error=cannot-cancel", request.url), 303);
    }

    await db.transaction(async (tx) => {
      await tx.update(bookings)
        .set({ status: "cancelled" })
        .where(eq(bookings.id, bookingId));

      const [holdTx] = await tx
        .select({ amount: walletTransactions.amount })
        .from(walletTransactions)
        .where(and(
          eq(walletTransactions.bookingId, bookingId),
          eq(walletTransactions.type, "booking_hold")
        ))
        .limit(1);

      if (holdTx) {
        await tx.update(users)
          .set({ tokenBalance: sql`${users.tokenBalance} + ${holdTx.amount}` })
          .where(eq(users.id, booking.learnerId));

        await tx.insert(walletTransactions).values({
          senderId: null,
          receiverId: booking.learnerId,
          amount: holdTx.amount,
          type: "refund",
          bookingId,
        });
      }
    });

    return NextResponse.redirect(new URL("/dashboard/learner?cancelled=1", request.url), 303);
  }

  if (action === "complete") {
    // Completion requires BOTH the mentor AND the learner to confirm.
    // Escrow is only released once both sides agree (admin can force-release).
    const isMentor  = booking.mentorId  === user.id;
    const isLearner = booking.learnerId === user.id;
    const isAdmin   = user.role === "admin";

    if (!isMentor && !isLearner && !isAdmin) {
      return NextResponse.redirect(new URL("/dashboard/learner?error=not-yours", request.url), 303);
    }

    const dashboard = isMentor && !isLearner ? "/dashboard/mentor" : "/dashboard/learner";

    if (booking.status === "completed" || booking.status === "cancelled") {
      return NextResponse.redirect(new URL(`${dashboard}?error=already-done`, request.url), 303);
    }

    // Record this party's confirmation. Admin counts as both sides.
    const mentorCompleted  = booking.mentorCompleted  || isMentor  || isAdmin;
    const learnerCompleted = booking.learnerCompleted || isLearner || isAdmin;
    const bothConfirmed    = mentorCompleted && learnerCompleted;

    await db.transaction(async (tx) => {
      await tx.update(bookings)
        .set({
          mentorCompleted,
          learnerCompleted,
          status: bothConfirmed ? "completed" : "confirmed",
        })
        .where(eq(bookings.id, bookingId));

      // Only release escrow on the transition where both sides have confirmed.
      if (!bothConfirmed) return;

      const [holdTx] = await tx
        .select({ amount: walletTransactions.amount })
        .from(walletTransactions)
        .where(and(
          eq(walletTransactions.bookingId, bookingId),
          eq(walletTransactions.type, "booking_hold")
        ))
        .limit(1);

      if (holdTx) {
        await tx.update(users)
          .set({ tokenBalance: sql`${users.tokenBalance} + ${holdTx.amount}` })
          .where(eq(users.id, booking.mentorId));

        await tx.insert(walletTransactions).values({
          senderId:   booking.learnerId,
          receiverId: booking.mentorId,
          amount:     holdTx.amount,
          type:       "booking_release",
          bookingId,
        });
      }
    });

    const flag = bothConfirmed ? "completed=1" : "awaiting=1";
    return NextResponse.redirect(new URL(`${dashboard}?${flag}`, request.url), 303);
  }

  return NextResponse.redirect(new URL("/dashboard/learner", request.url), 303);
}
