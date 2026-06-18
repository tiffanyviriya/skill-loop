import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db, projectApplications, businessProjects } from "@skill-loop/db";
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

  // Project must exist (avoids opaque FK errors on bad input).
  const [project] = await db
    .select({ id: businessProjects.id })
    .from(businessProjects)
    .where(eq(businessProjects.id, projectId))
    .limit(1);

  if (!project) {
    return NextResponse.redirect(new URL(`/projects?error=project-not-found`, request.url), 303);
  }

  // One application per project per applicant.
  const [existing] = await db
    .select({ id: projectApplications.id })
    .from(projectApplications)
    .where(and(
      eq(projectApplications.projectId, projectId),
      eq(projectApplications.applicantId, user.id)
    ))
    .limit(1);

  if (existing) {
    return NextResponse.redirect(new URL(`/projects?error=already-applied`, request.url), 303);
  }

  try {
    await db.insert(projectApplications).values({
      projectId,
      applicantId: user.id,
      proposal,
      status: "submitted"
    });
  } catch {
    // Unique constraint race — treat as duplicate.
    return NextResponse.redirect(new URL(`/projects?error=already-applied`, request.url), 303);
  }

  return NextResponse.redirect(new URL(`/projects?applied=${projectId}`, request.url), 303);
}
