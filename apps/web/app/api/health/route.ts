import { NextResponse } from "next/server";
import { db, users } from "@skill-loop/db";

export const runtime = "nodejs";

export async function GET() {
  if (!process.env.POSTGRES_URL) {
    return NextResponse.json({
      ok: true,
      database: "not_configured",
      message: "Add POSTGRES_URL from Vercel Postgres to enable live database queries."
    });
  }

  try {
    const result = await db.select({ id: users.id }).from(users).limit(1);

    return NextResponse.json({
      ok: true,
      database: "connected",
      sampledUsers: result.length
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        database: "error",
        message: error instanceof Error ? error.message : "Unknown database error"
      },
      { status: 500 }
    );
  }
}
