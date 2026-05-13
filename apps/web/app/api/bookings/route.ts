import { NextResponse } from "next/server";
import { bookings, db } from "@skill-loop/db";
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
  const skill = getSkillById(skillId);
  const user = await getCurrentUser();

  if (!skill) {
    return NextResponse.json({ ok: false, message: "Skill not found" }, { status: 404 });
  }

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url), 303);
  }

  if (user.role !== "learner" && user.role !== "admin") {
    return NextResponse.redirect(new URL("/marketplace?booking=learner-only", request.url), 303);
  }

  if (user.id === skill.mentorId) {
    return NextResponse.redirect(new URL(`/marketplace/${skill.id}?booking=self-blocked`, request.url), 303);
  }

  if (!process.env.POSTGRES_URL) {
    return NextResponse.redirect(new URL(`/dashboard/learner?booked=${skill.id}&mode=seed-demo`, request.url), 303);
  }

  await db.insert(bookings).values({
    skillId: skill.id,
    learnerId: user.id,
    mentorId: skill.mentorId,
    scheduleTime: new Date(scheduleTime),
    status: "pending"
  });

  return NextResponse.redirect(new URL(`/dashboard/learner?booked=${skill.id}`, request.url), 303);
}
