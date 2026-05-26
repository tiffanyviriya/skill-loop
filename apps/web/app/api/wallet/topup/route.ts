import { NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { db, users, walletTransactions } from "@skill-loop/db";
import { requireUser } from "../../../_lib/auth";

const VALID_AMOUNTS = [50, 100, 200, 500] as const;
const VALID_METHODS = ["qris", "bank_transfer"] as const;

export async function POST(request: Request) {
  const user = await requireUser();

  const form = await request.formData();
  const amount = Number(form.get("amount") ?? 0);
  const method = String(form.get("method") ?? "");

  // Validate amount
  if (!VALID_AMOUNTS.includes(amount as typeof VALID_AMOUNTS[number])) {
    return NextResponse.redirect(
      new URL("/topup?error=invalid-amount", request.url), 303
    );
  }

  // Validate payment method
  if (!VALID_METHODS.includes(method as typeof VALID_METHODS[number])) {
    return NextResponse.redirect(
      new URL("/topup?error=invalid-method", request.url), 303
    );
  }

  if (!process.env.POSTGRES_URL) {
    return NextResponse.redirect(
      new URL("/topup?error=demo-mode", request.url), 303
    );
  }

  // Process top-up atomically
  await db.transaction(async (tx) => {
    // Credit user's balance
    await tx
      .update(users)
      .set({ tokenBalance: sql`${users.tokenBalance} + ${amount}` })
      .where(eq(users.id, user.id));

    // Record wallet transaction
    await tx.insert(walletTransactions).values({
      receiverId: user.id,
      amount,
      type: "top_up",
    });
  });

  return NextResponse.redirect(
    new URL(`/dashboard/learner?topup=success&amount=${amount}`, request.url), 303
  );
}
