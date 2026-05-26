import { NextResponse } from "next/server";
import { db, projectApplications } from "@skill-loop/db";
import { getCurrentUser } from "../../../_lib/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const form = await request.formData();
  const projectId = String(form.get("projectId") ?? "");
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url), 303);
  }

  if (user.role === "business") {
    return NextResponse.redirect(new URL(`/projects?applied=business-blocked`, request.url), 303);
  }

  if (!process.env.POSTGRES_URL) {
    return NextResponse.redirect(new URL(`/projects?applied=${projectId}&mode=seed-demo`, request.url), 303);
  }

  const proposal = String(form.get("proposal") ?? "").trim();

  if (!proposal) {
    return NextResponse.redirect(new URL(`/projects?error=no-proposal`, request.url), 303);
  }

  await db.insert(projectApplications).values({
    projectId,
    applicantId: user.id,
    proposal,
    status: "submitted"
  });

  return NextResponse.redirect(new URL(`/projects?applied=${projectId}`, request.url), 303);
}
