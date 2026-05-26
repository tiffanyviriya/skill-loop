import { NextResponse } from "next/server";
import { and, eq, inArray, sql } from "drizzle-orm";
import { bookings, db, skills, users, walletTransactions } from "@skill-loop/db";
import { getSkillById, seedBookings } from "@skill-loop/domain";
import { getCurrentUser } from "../../_lib/auth";

export const runtime = "nodejs";

export async function GET() {
  if (!process.env.POSTGRES_URL) {
    return NextResponse.json({ source: "seed", data: seedBookings });
  }

  const rows = await db.select().from(bookings);

  return NextResponse.json({ source: "database", data: rows });
}

export async function POST(request: Request) {
  const form = await request.formData();
  const skillId = String(form.get("skillId") ?? "");
  const scheduleTime = String(form.get("scheduleTime") ?? "");
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url), 303);
  }

  if (user.role !== "learner" && user.role !== "admin") {
    return NextResponse.redirect(new URL("/marketplace?booking=learner-only", request.url), 303);
  }

  // Resolve skill from DB first, fall back to seed
  let skillMentorId: string | undefined;
  let priceToken = 0;

  if (process.env.POSTGRES_URL) {
    const [dbSkill] = await db.select().from(skills).where(eq(skills.id, skillId)).limit(1);
    if (!dbSkill) {
      return NextResponse.json({ ok: false, message: "Skill not found" }, { status: 404 });
    }
    skillMentorId = dbSkill.mentorId;
    priceToken = dbSkill.priceToken;
  } else {
    const seedSkill = getSkillById(skillId);
    if (!seedSkill) {
      return NextResponse.json({ ok: false, message: "Skill not found" }, { status: 404 });
    }
    skillMentorId = seedSkill.mentorId;
    priceToken = seedSkill.priceToken;
  }

  if (user.id === skillMentorId) {
    return NextResponse.redirect(new URL(`/marketplace/${skillId}?booking=self-blocked`, request.url), 303);
  }

  if (!process.env.POSTGRES_URL) {
    return NextResponse.redirect(new URL(`/dashboard/learner?booked=${skillId}&mode=seed-demo`, request.url), 303);
  }

  if (user.tokenBalance < priceToken) {
    return NextResponse.redirect(new URL(`/marketplace/${skillId}?booking=insufficient-tokens`, request.url), 303);
  }

  const [existing] = await db
    .select({ id: bookings.id })
    .from(bookings)
    .where(and(
      eq(bookings.learnerId, user.id),
      eq(bookings.skillId, skillId),
      inArray(bookings.status, ["pending", "confirmed"])
    ))
    .limit(1);

  if (existing) {
    return NextResponse.redirect(new URL(`/marketplace/${skillId}?booking=already-booked`, request.url), 303);
  }

  await db.transaction(async (tx) => {
    const [newBooking] = await tx.insert(bookings).values({
      skillId,
      learnerId: user.id,
      mentorId: skillMentorId!,
      scheduleTime: new Date(scheduleTime),
      status: "pending",
    }).returning({ id: bookings.id });

    await tx.update(users)
      .set({ tokenBalance: sql`${users.tokenBalance} - ${priceToken}` })
      .where(eq(users.id, user.id));

    await tx.insert(walletTransactions).values({
      senderId: user.id,
      receiverId: skillMentorId!,
      amount: priceToken,
      type: "booking_hold",
      bookingId: newBooking.id,
    });
  });

  return NextResponse.redirect(new URL(`/dashboard/learner?booked=${skillId}`, request.url), 303);
}
