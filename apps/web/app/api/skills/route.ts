import { NextResponse } from "next/server";
import { db, skills, users } from "@skill-loop/db";
import { seedSkills } from "@skill-loop/domain";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";

export async function GET() {
  if (!process.env.POSTGRES_URL) {
    return NextResponse.json({ source: "seed", data: seedSkills });
  }

  const rows = await db
    .select({
      id: skills.id,
      mentorName: users.name,
      title: skills.title,
      description: skills.description,
      category: skills.category,
      priceToken: skills.priceToken,
      mode: skills.mode,
      location: skills.location
    })
    .from(skills)
    .innerJoin(users, eq(skills.mentorId, users.id));

  return NextResponse.json({ source: "database", data: rows });
}
