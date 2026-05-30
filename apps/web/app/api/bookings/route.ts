import { NextResponse } from "next/server";
import { and, eq, inArray, sql } from "drizzle-orm";
import { bookings, db, skills, users, walletTransactions } from "@skill-loop/db";
import { getSkillById, seedBookings } from "@skill-loop/domain";
import { getCurrentUser } from "../../_lib/auth";
import { hashPassword } from "../../_lib/password";

export const runtime = "nodejs";

// ─── Seed mentor data (auto-inserted when a seed class is booked) ─────────────
const SEED_MENTORS = [
  { id: "22222222-2222-4222-8222-222222222222", name: "Nadia Putri",  email: "mentor@skillloop.test",  tokenBalance: 260, trustScore: 92 },
  { id: "55555555-5555-4555-8555-555555555555", name: "Raka Santoso", email: "raka@skillloop.test",    tokenBalance: 180, trustScore: 89 },
  { id: "66666666-6666-4666-8666-666666666666", name: "Maya Chen",    email: "maya@skillloop.test",    tokenBalance: 140, trustScore: 86 },
  { id: "77777777-7777-4777-8777-777777777777", name: "Dimas Pratama",email: "dimas@skillloop.test",   tokenBalance: 220, trustScore: 90 },
] as const;

// ─── Auto-seed a skill (and its mentor) into the DB if not yet present ────────
async function ensureSeedSkillInDb(skillId: string): Promise<{ mentorId: string; priceToken: number } | null> {
  const seed = getSkillById(skillId);
  if (!seed) return null;

  // 1. Ensure mentor user exists
  const mentor = SEED_MENTORS.find((m) => m.id === seed.mentorId);
  if (mentor) {
    await db.insert(users).values({
      id: mentor.id,
      name: mentor.name,
      email: mentor.email,
      passwordHash: hashPassword("skillloop123"),
      role: "mentor",
      tokenBalance: mentor.tokenBalance,
      trustScore: mentor.trustScore,
    }).onConflictDoNothing();
  }

  // 2. Ensure skill exists
  await db.insert(skills).values({
    id: seed.id,
    mentorId: seed.mentorId,
    title: seed.title,
    description: seed.description,
    category: seed.category,
    priceToken: seed.priceToken,
    mode: seed.mode,
    location: seed.location,
  }).onConflictDoNothing();

  return { mentorId: seed.mentorId, priceToken: seed.priceToken };
}

// ─── Routes ───────────────────────────────────────────────────────────────────

export async function GET() {
  if (!process.env.POSTGRES_URL) {
    return NextResponse.json({ source: "seed", data: seedBookings });
  }
  const rows = await db.select().from(bookings);
  return NextResponse.json({ source: "database", data: rows });
}

export async function POST(request: Request) {
  const form = await request.formData();
  const skillId     = String(form.get("skillId")     ?? "");
  const scheduleTime = String(form.get("scheduleTime") ?? "");
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url), 303);
  }

  if (user.role !== "learner" && user.role !== "admin") {
    return NextResponse.redirect(new URL(`/marketplace/${skillId}?booking=learner-only`, request.url), 303);
  }

  let skillMentorId: string;
  let priceToken: number;

  if (!process.env.POSTGRES_URL) {
    // ── Seed/demo mode ──────────────────────────────────────────────────────
    const seedSkill = getSkillById(skillId);
    if (!seedSkill) {
      return NextResponse.redirect(new URL("/marketplace?booking=not-found", request.url), 303);
    }
    skillMentorId = seedSkill.mentorId;
    priceToken    = seedSkill.priceToken;

    if (user.id === skillMentorId) {
      return NextResponse.redirect(new URL(`/marketplace/${skillId}?booking=self-blocked`, request.url), 303);
    }
    return NextResponse.redirect(new URL(`/dashboard/learner?booked=${skillId}&mode=seed-demo`, request.url), 303);
  }

  // ── DB mode ─────────────────────────────────────────────────────────────
  let dbSkill = (await db.select().from(skills).where(eq(skills.id, skillId)).limit(1))[0];

  if (!dbSkill) {
    // Skill not in DB yet — auto-seed it (and mentor) on demand
    const seeded = await ensureSeedSkillInDb(skillId);
    if (!seeded) {
      return NextResponse.redirect(new URL("/marketplace?booking=not-found", request.url), 303);
    }
    // Re-fetch after insert so we have a proper DB row
    dbSkill = (await db.select().from(skills).where(eq(skills.id, skillId)).limit(1))[0];
    if (!dbSkill) {
      return NextResponse.redirect(new URL("/marketplace?booking=not-found", request.url), 303);
    }
  }

  skillMentorId = dbSkill.mentorId;
  priceToken    = dbSkill.priceToken;

  if (user.id === skillMentorId) {
    return NextResponse.redirect(new URL(`/marketplace/${skillId}?booking=self-blocked`, request.url), 303);
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
      mentorId: skillMentorId,
      scheduleTime: new Date(scheduleTime),
      status: "pending",
    }).returning({ id: bookings.id });

    await tx.update(users)
      .set({ tokenBalance: sql`${users.tokenBalance} - ${priceToken}` })
      .where(eq(users.id, user.id));

    await tx.insert(walletTransactions).values({
      senderId:   user.id,
      receiverId: skillMentorId,
      amount:     priceToken,
      type:       "booking_hold",
      bookingId:  newBooking.id,
    });
  });

  return NextResponse.redirect(new URL(`/dashboard/learner?booked=${skillId}`, request.url), 303);
}
