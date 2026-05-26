import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db, skills, users } from "@skill-loop/db";
import { seedSkills } from "@skill-loop/domain";
import { getCurrentUser } from "../../_lib/auth";

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

export async function POST(request: Request) {
  const form = await request.formData();
  const title = String(form.get("title") ?? "").trim();
  const category = String(form.get("category") ?? "").trim();
  const description = String(form.get("description") ?? "").trim();
  const priceToken = Number(form.get("priceToken") ?? 0);
  const mode = String(form.get("mode") ?? "online") as "online" | "offline" | "hybrid";
  const location = String(form.get("location") ?? "").trim() || null;

  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url), 303);
  }

  if (user.role !== "mentor" && user.role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard/mentor?class=mentor-only", request.url), 303);
  }

  if (!title || !category || !description || priceToken < 1) {
    return NextResponse.redirect(new URL("/dashboard/mentor?class=invalid", request.url), 303);
  }

  if (!process.env.POSTGRES_URL) {
    return NextResponse.redirect(new URL("/dashboard/mentor?class=seed-demo", request.url), 303);
  }

  await db.insert(skills).values({
    mentorId: user.id,
    title,
    description,
    category,
    priceToken,
    mode,
    location,
  });

  return NextResponse.redirect(new URL("/dashboard/mentor?class=created", request.url), 303);
}
