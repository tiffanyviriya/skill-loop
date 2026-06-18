import Link from "next/link";
import { eq, desc, inArray, and } from "drizzle-orm";
import { BadgeCheck, CalendarCheck, Coins, TrendingUp } from "lucide-react";
import { db, bookings, skills, walletTransactions, users } from "@skill-loop/db";
import { seedBookings, seedLeaderboard, seedSkills } from "@skill-loop/domain";
import { requireUser } from "../../_lib/auth";
import { PageIntro, PlatformShell } from "../../_components/shell";

type DisplaySkill = {
  id: string;
  title: string;
  category: string;
  priceToken: number;
  mode: string;
};

type DisplayBooking = {
  id: string;
  skillTitle: string;
  learnerName: string;
  scheduleTime: string;
  status: string;
};

export default async function MentorDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ completed?: string; awaiting?: string; class?: string; error?: string; mode?: string }>;
}) {
  const user = await requireUser(["mentor", "admin"]);
  const params = await searchParams;
  const hasDb = !!process.env.POSTGRES_URL;

  let mentorSkills: DisplaySkill[] = [];
  let upcomingBookings: DisplayBooking[] = [];
  let pendingTokenRelease = 0;

  if (!process.env.POSTGRES_URL) {
    mentorSkills = seedSkills
      .filter((s) => s.mentorId === user.id)
      .map((s) => ({
        id: s.id,
        title: s.title,
        category: s.category,
        priceToken: s.priceToken,
        mode: s.mode,
      }));
    upcomingBookings = seedBookings
      .filter((b) => b.mentorName === user.name && b.status !== "completed")
      .map((b) => ({
        id: b.id,
        skillTitle: b.skillTitle,
        learnerName: b.learnerName,
        scheduleTime: b.scheduleTime,
        status: b.status,
      }));
    pendingTokenRelease = 42;
  } else {
    const dbSkills = await db
      .select({
        id: skills.id,
        title: skills.title,
        category: skills.category,
        priceToken: skills.priceToken,
        mode: skills.mode,
      })
      .from(skills)
      .where(eq(skills.mentorId, user.id))
      .orderBy(desc(skills.createdAt));

    mentorSkills = dbSkills;

    const rawUpcoming = await db
      .select({
        id: bookings.id,
        status: bookings.status,
        scheduleTime: bookings.scheduleTime,
        skillTitle: skills.title,
        learnerId: bookings.learnerId,
      })
      .from(bookings)
      .innerJoin(skills, eq(bookings.skillId, skills.id))
      .where(and(eq(bookings.mentorId, user.id), inArray(bookings.status, ["pending", "confirmed"])))
      .orderBy(desc(bookings.scheduleTime));

    const learnerIds = [...new Set(rawUpcoming.map((b) => b.learnerId))];
    const learnerList = learnerIds.length > 0
      ? await db.select({ id: users.id, name: users.name }).from(users).where(inArray(users.id, learnerIds))
      : [];
    const learnerMap = Object.fromEntries(learnerList.map((l) => [l.id, l.name]));

    upcomingBookings = rawUpcoming.map((b) => ({
      id: b.id,
      skillTitle: b.skillTitle,
      learnerName: learnerMap[b.learnerId] ?? "—",
      scheduleTime: b.scheduleTime instanceof Date
        ? b.scheduleTime.toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })
        : String(b.scheduleTime),
      status: b.status,
    }));

    const pendingTxs = await db
      .select({ amount: walletTransactions.amount })
      .from(walletTransactions)
      .where(and(
        eq(walletTransactions.receiverId, user.id),
        eq(walletTransactions.type, "booking_hold")
      ));
    pendingTokenRelease = pendingTxs.reduce((sum, tx) => sum + tx.amount, 0);
  }

  return (
    <PlatformShell>
      <PageIntro
        eyebrow="Mentor dashboard"
        title={`Manage classes, complete sessions, and earn tokens, ${user.name}.`}
        description="Mentors create classes, receive bookings, complete sessions, and grow their trust score."
        action={<Link className="button-fin" href="/marketplace">View marketplace</Link>}
      />

      {params.completed === "1" && <div className="container"><p className="auth-success mb-4">Session marked as completed. Tokens released to your balance!</p></div>}
      {params.awaiting === "1" && <div className="container"><p className="auth-success mb-4">Konfirmasi kamu tersimpan. Token dilepas setelah learner juga mengonfirmasi.</p></div>}
      {params.error === "already-done" && <div className="container"><p className="auth-error mb-4">Sesi ini sudah selesai atau dibatalkan.</p></div>}
      {params.class === "created" && <div className="container"><p className="auth-success mb-4">Class published successfully!</p></div>}
      {params.class === "seed-demo" && <div className="container"><p className="auth-error mb-4">Publishing requires a database connection (demo mode).</p></div>}
      {params.mode === "seed-demo" && <div className="container"><p className="auth-error mb-4">This action requires a database connection (demo mode).</p></div>}

      <section className="container grid grid-cols-[1fr_380px] gap-4 pb-24 max-[900px]:grid-cols-1">
        <div className="product-card">
          <div className="panel-header">
            <h2 className="card-title">Your classes</h2>
            <BadgeCheck size={22} />
          </div>
          <div className="market-grid">
            {mentorSkills.length === 0 ? (
              <p className="text-sm text-muted px-1 col-span-full">No classes yet. Create your first class using the form on the right.</p>
            ) : (
              mentorSkills.map((skill) => (
                <article className="project-card" key={skill.id}>
                  <p className="eyebrow">{skill.category}</p>
                  <h3>{skill.title}</h3>
                  <p>{skill.mode}</p>
                  <div className="meta-row">
                    <span className="badge orange">{skill.priceToken} token</span>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>

        <aside className="grid gap-4">
          <article className="stat-card accent-green">
            <TrendingUp size={22} />
            <span>Token balance</span>
            <strong>{user.tokenBalance}</strong>
          </article>
          <article className="stat-card accent-orange">
            <Coins size={22} />
            <span>Pending token release</span>
            <strong>{pendingTokenRelease}</strong>
          </article>
          <article className="project-card accent-blue">
            <div className="panel-header">
              <h2 className="card-title">Upcoming</h2>
              <CalendarCheck size={20} />
            </div>
            <div className="list-stack">
              {upcomingBookings.length === 0 ? (
                <p className="text-sm text-muted px-1">No upcoming sessions.</p>
              ) : (
                upcomingBookings.map((booking) => (
                  <div className="list-row" key={booking.id}>
                    <div>
                      <strong>{booking.skillTitle}</strong>
                      <p>{booking.learnerName} · {booking.scheduleTime}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="badge blue">{booking.status}</span>
                      {hasDb && (
                        <form action={`/api/bookings/${booking.id}`} method="post">
                          <input type="hidden" name="action" value="complete" />
                          <button className="badge green" type="submit">Mark complete</button>
                        </form>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </article>
          <article className="project-card accent-pink">
            <p className="eyebrow">Create class</p>
            <h2 className="card-title">New skill offer</h2>
            <form className="grid gap-3" action="/api/skills" method="post">
              <input
                className="rounded-lg border border-hairline px-3 py-3"
                name="title"
                placeholder="Class title"
                required
              />
              <input
                className="rounded-lg border border-hairline px-3 py-3"
                name="category"
                placeholder="Category (e.g. Design, Coding)"
                required
              />
              <textarea
                className="rounded-lg border border-hairline px-3 py-3 min-h-16"
                name="description"
                placeholder="What will learners get from this class?"
                required
              />
              <input
                className="rounded-lg border border-hairline px-3 py-3"
                name="priceToken"
                type="number"
                min="1"
                placeholder="Token price"
                required
              />
              <select className="rounded-lg border border-hairline bg-white px-3 py-3" name="mode">
                <option value="online">Online</option>
                <option value="offline">Offline</option>
                <option value="hybrid">Hybrid</option>
              </select>
              <input
                className="rounded-lg border border-hairline px-3 py-3"
                name="location"
                placeholder="Location (optional)"
              />
              <button className="button-fin" type="submit">Publish class</button>
            </form>
          </article>
        </aside>
      </section>
      <section className="container pb-24">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Ecosystem incentives</p>
            <h2>Leaderboard drives mentor activity without making trust noisy.</h2>
          </div>
        </div>
        <div className="feature-grid">
          {seedLeaderboard.map((mentor) => (
            <article className="feature-card" key={mentor.name}>
              <p className="eyebrow">Rank #{mentor.rank}</p>
              <h3>{mentor.name}</h3>
              <p>{mentor.specialty} · {mentor.sessions} sessions · {mentor.rating} rating</p>
              <span className={mentor.badge === "verified" ? "badge green" : "badge blue"}>{mentor.badge}</span>
            </article>
          ))}
        </div>
      </section>
    </PlatformShell>
  );
}
