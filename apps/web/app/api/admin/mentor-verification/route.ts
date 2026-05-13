import { NextResponse } from "next/server";
import { getCurrentUser } from "../../../_lib/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const form = await request.formData();
  const mentorId = String(form.get("mentorId") ?? "");
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url), 303);
  }

  if (user.role !== "admin") {
    return NextResponse.redirect(new URL("/admin?verified=admin-only", request.url), 303);
  }

  return NextResponse.redirect(new URL(`/admin?verified=${mentorId}`, request.url), 303);
}
