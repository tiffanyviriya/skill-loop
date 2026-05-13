import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const form = await request.formData();
  const mentorId = String(form.get("mentorId") ?? "");

  return NextResponse.redirect(new URL(`/admin?verified=${mentorId}`, request.url), 303);
}
