import { NextResponse } from "next/server";
import { db, projectApplications } from "@skill-loop/db";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const form = await request.formData();
  const projectId = String(form.get("projectId") ?? "");

  if (!process.env.POSTGRES_URL) {
    return NextResponse.redirect(new URL(`/projects?applied=${projectId}&mode=seed-demo`, request.url), 303);
  }

  await db.insert(projectApplications).values({
    projectId,
    applicantId: "00000000-0000-0000-0000-000000000003",
    proposal: "I can help with this project and share portfolio examples.",
    status: "submitted"
  });

  return NextResponse.redirect(new URL(`/projects?applied=${projectId}`, request.url), 303);
}
