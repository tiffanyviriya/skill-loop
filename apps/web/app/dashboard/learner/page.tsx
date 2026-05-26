import Link from "next/link";
import { eq, desc, or, inArray } from "drizzle-orm";
import { BookOpen, Coins, PenLine, Star, Trophy } from "lucide-react";
import { db, bookings, skills, walletTransactions, reviews, users } from "@skill-loop/db";
import { seedBookings, seedSkills, seedWalletTransactions } from "@skill-loop/domain";
import { requireUser } from "../../_lib/auth";
import { PageIntro, PlatformShell } from "../../_components/shell";

type DisplayBooking = {
  id: string;
  skillTitle: string;
  scheduleTime: string;
  mentorName: string;
  status: string;
};

type DisplayTransaction = {
  id: string;
  label: string;
  amount: number;
  type: string;
  createdAt: string;
};

function txLabel(type: string): string {
  const labels: Record<string, string> = {
    booking_hold: "Booking held",
    booking_release: "Session payment released",
    review_bonus: "Review bonus",
    top_up: "Token top-up",
    refund: "Refund",
  };
  return labels[type] ?? type;
}

export default async function LearnerDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ booked?: string; cancelled?: string; reviewed?: string; error?: string; mode?: string; topup?: string; amount?: string }>;
}) {
  const user = await requireUser(["learner", "admin"]);
  const params = await searchParams;
  const hasDb = !!process.env.POSTGRES_URL;

  let displayBookings: DisplayBooking[] = [];
  let displayTransactions: DisplayTransaction[] = [];
  let reviewableBookingId: string | null = null;
  let completedCount = 0;

  if (!process.env.POSTGRES_URL) {
    const myBookings = seedBookings.filter((b) => b.learnerName === user.name);
    displayBookings = myBookings.map((b) => ({
      id: b.id,
      skillTitle: b.skillTitle,
      scheduleTime: b.scheduleTime,
      mentorName: b.mentorName,
      status: b.status,
    }));
    displayTransactions = seedWalletTransactions.map((t) => ({
      id: t.id,
      label: t.label,
      amount: t.amount,
      type: t.type,
      createdAt: t.createdAt,
    }));
    completedCount = myBookings.filter((b) => b.status === "completed").length;
    reviewableBookingId = myBookings.find((b) => b.status === "completed")?.id ?? null;
  } else {
    const rawBookings = await db
      .select({
        id: bookings.id,
        status: bookings.status,
        scheduleTime: bookings.scheduleTime,
        skillTitle: skills.title,
        mentorId: bookings.mentorId,
      })
      .from(bookings)
      .innerJoin(skills, eq(bookings.skillId, skills.id))
      .where(eq(bookings.learnerId, user.id))
      .orderBy(desc(bookings.createdAt));

    const mentorIds = [...new Set(rawBookings.map((b) => b.mentorId))];
    const mentorList = mentorIds.length > 0
      ? await db.select({ id: users.id, name: users.name }).from(users).where(inArray(users.id, mentorIds))
      : [];
    const mentorMap = Object.fromEntries(mentorList.map((m) => [m.id, m.name]));

    displayBookings = rawBookings.map((b) => ({
      id: b.id,
      skillTitle: b.skillTitle,
      scheduleTime: b.scheduleTime instanceof Date
        ? b.scheduleTime.toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })
        : String(b.scheduleTime),
      mentorName: mentorMap[b.mentorId] ?? "—",
      status: b.status,
    }));

    completedCount = rawBookings.filter((b) => b.status === "completed").length;

    const existingReviews = await db
      .select({ bookingId: reviews.bookingId })
      .from(reviews)
      .where(eq(reviews.reviewerId, user.id));
    const reviewedIds = new Set(existingReviews.map((r) => r.bookingId));
    reviewableBookingId = rawBookings.find(
      (b) => b.status === "completed" && !reviewedIds.has(b.id)
    )?.id ?? null;

    const txRows = await db
      .select()
      .from(walletTransactions)
      .where(or(eq(walletTransactions.senderId, user.id), eq(walletTransactions.receiverId, user.id)))
      .orderBy(desc(walletTransactions.createdAt))
      .limit(10);

    displayTransactions = txRows.map((t) => ({
      id: t.id,
      label: txLabel(t.type),
      amount: t.senderId === user.id ? -t.amount : t.amount,
      type: t.type,
      createdAt: t.createdAt instanceof Date
        ? t.createdAt.toLocaleDateString("id-ID", { dateStyle: "medium" })
        : String(t.createdAt),
    }));
  }

  let recommendedSkills: { id: string; title: string; category: string; priceToken: number; mentorName: string }[] = [];
  if (!process.env.POSTGRES_URL) {
    recommendedSkills = seedSkills.slice(0, 3).map((s) => ({
      id: s.id,
      title: s.title,
      category: s.category,
      priceToken: s.priceToken,
      mentorName: s.mentorName,
    }));
  } else {
    recommendedSkills = await db
      .select({
        id: skills.id,
        title: skills.title,
        category: skills.category,
        priceToken: skills.priceToken,
        mentorName: users.name,
      })
      .from(skills)
      .innerJoin(users, eq(skills.mentorId, users.id))
      .limit(3);
  }

  return (
    <PlatformShell>
      <PageIntro
        eyebrow="Learner dashboard"
        title={`Track bookings, token balance, and learning momentum, ${user.name}.`}
        description="This is the learner side of the platform loop: discover skills, spend tokens, complete sessions, and review mentors."
        action={<Link className="button-primary" href="/marketplace">Book another class</Link>}
      />

      <section className="container pb-24">
        {params.booked && <p className="auth-success mb-4">Booking confirmed! Check your bookings below.</p>}
        {params.cancelled === "1" && <p className="auth-success mb-4">Booking cancelled and tokens refunded to your balance.</p>}
        {params.reviewed && <p className="auth-success mb-4">Review submitted successfully. Thank you!</p>}
        {params.topup === "success" && <p className="auth-success mb-4">Top-up berhasil! {params.amount} token telah ditambahkan ke saldo kamu.</p>}
        {params.mode === "seed-demo" && <p className="auth-error mb-4">This action requires a database connection (demo mode).</p>}

        <div className="dashboard-grid">
          <div className="product-card">
            <div className="panel-header">
              <h2 className="card-title">Bookings</h2>
              <BookOpen size={22} />
            </div>
            <div className="list-stack">
              {displayBookings.length === 0 ? (
                <p className="text-sm text-muted px-1">No bookings yet. <Link href="/marketplace" className="underline">Browse classes</Link>.</p>
              ) : (
                displayBookings.map((booking) => (
                  <div className="list-row" key={booking.id}>
                    <div>
                      <strong>{booking.skillTitle}</strong>
                      <p>{booking.scheduleTime} · {booking.mentorName}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={
                        booking.status === "completed" ? "badge green" :
                        booking.status === "cancelled" ? "badge orange" :
                        "badge blue"
                      }>{booking.status}</span>
                      {booking.status === "pending" && hasDb && (
                        <form action={`/api/bookings/${booking.id}`} method="post">
                          <input type="hidden" name="action" value="cancel" />
                          <button className="badge orange" type="submit">Cancel</button>
                        </form>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="grid gap-4">
            <div className="stats-grid">
              <article className="stat-card accent-orange">
                <Coins size={22} />
                <span>Token balance</span>
                <strong>{user.tokenBalance}</strong>
                <Link className="button-fin mt-3 text-xs min-h-[34px]" href="/topup">Top up token</Link>
              </article>
              <article className="stat-card accent-blue">
                <Star size={22} />
                <span>Trust score</span>
                <strong>{user.trustScore}</strong>
              </article>
              <article className="stat-card accent-green">
                <Trophy size={22} />
                <span>Completed</span>
                <strong>{completedCount}</strong>
              </article>
            </div>
            <div className="product-card">
              <div className="panel-header">
                <h2 className="card-title">Wallet activity</h2>
                <span className="badge orange">Teach to earn</span>
              </div>
              <div className="list-stack">
                {displayTransactions.length === 0 ? (
                  <p className="text-sm text-muted px-1">No transactions yet.</p>
                ) : (
                  displayTransactions.map((transaction) => (
                    <div className="list-row" key={transaction.id}>
                      <div>
                        <strong>{transaction.label}</strong>
                        <p>{transaction.createdAt} · {transaction.type}</p>
                      </div>
                      <span className={transaction.amount > 0 ? "badge green" : "badge orange"}>
                        {transaction.amount > 0 ? "+" : ""}
                        {transaction.amount}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
            {reviewableBookingId ? (
              <div className="project-card accent-pink">
                <div className="panel-header">
                  <h2 className="card-title">Review completed session</h2>
                  <PenLine size={20} />
                </div>
                <form className="grid gap-3" action="/api/reviews" method="post">
                  <input type="hidden" name="bookingId" value={reviewableBookingId} />
                  <label className="grid gap-2 text-sm font-medium">
                    Rating
                    <select className="rounded-lg border border-hairline bg-white px-3 py-3" name="rating" defaultValue="5">
                      <option value="5">5 - Excellent</option>
                      <option value="4">4 - Good</option>
                      <option value="3">3 - Useful</option>
                    </select>
                  </label>
                  <textarea
                    className="min-h-24 rounded-lg border border-hairline px-3 py-3"
                    name="comment"
                    placeholder="Share your experience with this mentor..."
                  />
                  <button className="button-primary" type="submit">Submit review</button>
                </form>
              </div>
            ) : (
              <div className="project-card">
                <div className="panel-header">
                  <h2 className="card-title">Review a session</h2>
                  <PenLine size={20} />
                </div>
                <p className="text-sm text-muted">No completed sessions to review yet. Complete a booking to unlock this.</p>
              </div>
            )}
          </div>
        </div>
        <div className="mt-4 feature-grid">
          {recommendedSkills.map((skill) => (
            <article className="feature-card" key={skill.id}>
              <p className="eyebrow">Recommended next</p>
              <h3>{skill.title}</h3>
              <p>{skill.category} · {skill.priceToken} token · {skill.mentorName}</p>
              <Link className="button-secondary mt-3" href={`/marketplace/${skill.id}`}>View class</Link>
            </article>
          ))}
        </div>
      </section>
    </PlatformShell>
  );
}
