import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db, projectApplications, businessProjects } from "@skill-loop/db";
import { getCurrentUser } from "../../../../_lib/auth";

export const runtime = "nodejs";

const VALID_STATUSES = ["shortlisted", "accepted", "rejected"] as const;
type UpdateableStatus = typeof VALID_STATUSES[number];

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: applicationId } = await params;
  const form = await request.formData();
  const newStatus = String(form.get("status") ?? "") as UpdateableStatus;
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url), 303);
  }

  if (user.role !== "business" && user.role !== "admin") {
    return NextResponse.redirect(new URL("/projects?error=owner-only", request.url), 303);
  }

  if (!VALID_STATUSES.includes(newStatus)) {
    return NextResponse.redirect(new URL("/projects?error=invalid-status", request.url), 303);
  }

  if (!process.env.POSTGRES_URL) {
    return NextResponse.redirect(new URL("/projects?mode=seed-demo", request.url), 303);
  }

  const [application] = await db
    .select({
      id: projectApplications.id,
      businessId: businessProjects.businessId,
    })
    .from(projectApplications)
    .innerJoin(businessProjects, eq(projectApplications.projectId, businessProjects.id))
    .where(eq(projectApplications.id, applicationId))
    .limit(1);

  if (!application) {
    return NextResponse.redirect(new URL("/projects?error=not-found", request.url), 303);
  }

  if (application.businessId !== user.id && user.role !== "admin") {
    return NextResponse.redirect(new URL("/projects?error=not-your-project", request.url), 303);
  }

  await db.update(projectApplications)
    .set({ status: newStatus })
    .where(eq(projectApplications.id, applicationId));

  return NextResponse.redirect(new URL("/projects?updated=1", request.url), 303);
}
