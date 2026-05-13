import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "../../../_lib/auth";

export const runtime = "nodejs";

export function GET(request: Request) {
  return NextResponse.redirect(new URL("/login", request.url), 303);
}

export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL("/", request.url), 303);
  response.cookies.delete(SESSION_COOKIE);

  return response;
}
