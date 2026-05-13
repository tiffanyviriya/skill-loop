import { NextResponse } from "next/server";
import { businessProjects, db } from "@skill-loop/db";
import { seedProjects } from "@skill-loop/domain";

export const runtime = "nodejs";

export async function GET() {
  if (!process.env.POSTGRES_URL) {
    return NextResponse.json({ source: "seed", data: seedProjects });
  }

  const rows = await db.select().from(businessProjects);

  return NextResponse.json({ source: "database", data: rows });
}

export async function POST(request: Request) {
  const form = await request.formData();
  const title = String(form.get("title") ?? "");
  const description = String(form.get("description") ?? "");
  const requiredSkill = String(form.get("requiredSkill") ?? "");
  const rewardToken = Number(form.get("rewardToken") ?? 0);

  if (!process.env.POSTGRES_URL) {
    return NextResponse.redirect(new URL("/projects?created=seed-demo", request.url), 303);
  }

  await db.insert(businessProjects).values({
    businessId: "00000000-0000-0000-0000-000000000001",
    title,
    description,
    requiredSkill,
    rewardToken,
    status: "open"
  });

  return NextResponse.redirect(new URL("/projects?created=1", request.url), 303);
}
