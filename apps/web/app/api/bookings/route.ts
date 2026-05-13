import { NextResponse } from "next/server";
import { bookings, db } from "@skill-loop/db";
import { getSkillById, seedBookings } from "@skill-loop/domain";

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

  if (!skill) {
    return NextResponse.json({ ok: false, message: "Skill not found" }, { status: 404 });
  }

  if (!process.env.POSTGRES_URL) {
    return NextResponse.redirect(new URL(`/dashboard/learner?booked=${skill.id}&mode=seed-demo`, request.url), 303);
  }

  await db.insert(bookings).values({
    skillId: skill.id,
    learnerId: "00000000-0000-0000-0000-000000000002",
    mentorId: "00000000-0000-0000-0000-000000000003",
    scheduleTime: new Date(scheduleTime),
    status: "pending"
  });

  return NextResponse.redirect(new URL(`/dashboard/learner?booked=${skill.id}`, request.url), 303);
}
