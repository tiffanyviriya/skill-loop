import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { AlertCircle, CalendarCheck, Coins, ShieldCheck, Star } from "lucide-react";
import { db, skills, users } from "@skill-loop/db";
import { getSkillById } from "@skill-loop/domain";
import { getCurrentUser } from "../../_lib/auth";
import { PageIntro, PlatformShell } from "../../_components/shell";

type SkillDetail = {
  id: string;
  mentorId: string;
  mentorName: string;
  mentorBadge: string;
  mentorRating: number | null;
  sessionsCompleted: number | null;
  trustScore: number;
  title: string;
  description: string;
  category: string;
  priceToken: number;
  mode: string;
  location: string;
  schedule: string[];
};

function upcomingSlots(count = 3): string[] {
  const result: string[] = [];
  const d = new Date();
  d.setDate(d.getDate() + 1);
  while (result.length < count) {
    const label = d.toLocaleDateString("en-US", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    result.push(`${label} at 16:00`);
    d.setDate(d.getDate() + 2);
  }
  return result;
}

export default async function SkillDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ booking?: string }>;
}) {
  const { id } = await params;
  const { booking: bookingError } = await searchParams;
  const user = await getCurrentUser();

  let skill: SkillDetail | null = null;

  if (process.env.POSTGRES_URL) {
    const [row] = await db
      .select({
        id: skills.id,
        mentorId: skills.mentorId,
        mentorName: users.name,
        mentorTrustScore: users.trustScore,
        title: skills.title,
        description: skills.description,
        category: skills.category,
        priceToken: skills.priceToken,
        mode: skills.mode,
        location: skills.location,
      })
      .from(skills)
      .innerJoin(users, eq(skills.mentorId, users.id))
      .where(eq(skills.id, id))
      .limit(1);

    if (row) {
      skill = {
        id: row.id,
        mentorId: row.mentorId,
        mentorName: row.mentorName,
        mentorBadge: row.mentorTrustScore >= 90 ? "verified" : "community",
        mentorRating: null,
        sessionsCompleted: null,
        trustScore: row.mentorTrustScore,
        title: row.title,
        description: row.description,
        category: row.category,
        priceToken: row.priceToken,
        mode: row.mode,
        location: row.location ?? "Online",
        schedule: [],
      };
    } else {
      // DB connected but skill not found — try seed data (e.g. example classes)
      const seed = getSkillById(id);
      if (seed) {
        skill = {
          id: seed.id,
          mentorId: seed.mentorId,
          mentorName: seed.mentorName,
          mentorBadge: seed.mentorBadge,
          mentorRating: seed.mentorRating,
          sessionsCompleted: seed.sessionsCompleted,
          trustScore: seed.trustScore,
          title: seed.title,
          description: seed.description,
          category: seed.category,
          priceToken: seed.priceToken,
          mode: seed.mode,
          location: seed.location,
          schedule: seed.schedule,
        };
      }
    }
  } else {
    const seed = getSkillById(id);
    if (seed) {
      skill = {
        id: seed.id,
        mentorId: seed.mentorId,
        mentorName: seed.mentorName,
        mentorBadge: seed.mentorBadge,
        mentorRating: seed.mentorRating,
        sessionsCompleted: seed.sessionsCompleted,
        trustScore: seed.trustScore,
        title: seed.title,
        description: seed.description,
        category: seed.category,
        priceToken: seed.priceToken,
        mode: seed.mode,
        location: seed.location,
        schedule: seed.schedule,
      };
    }
  }

  if (!skill) notFound();

  // Filter to future dates only, fall back to generated slots
  const now = new Date();
  const futureSeeds = skill.schedule.filter((s) => {
    try { return new Date(s) > now; } catch { return false; }
  });
  const schedule = futureSeeds.length > 0 ? futureSeeds : upcomingSlots(3);

  const canBook = user && (user.role === "learner" || user.role === "admin") && user.id !== skill.mentorId;
  const hasEnoughTokens = user ? user.tokenBalance >= skill.priceToken : false;

  return (
    <PlatformShell>
      <PageIntro
        eyebrow={skill.category}
        title={skill.title}
        description={skill.description}
        action={<Link className="button-secondary" href="/marketplace">Back to marketplace</Link>}
      />

      <section className="container grid grid-cols-[1fr_420px] gap-4 pb-24 max-[900px]:grid-cols-1">
        <article className="product-card">
          <div className="mockup-shell">
            <div className="mockup-toolbar">
              <strong>Class detail</strong>
              <span>{skill.mode} · {skill.location}</span>
            </div>
            <div className="mockup-grid">
              <div className="mockup-panel accent-blue">
                <p className="eyebrow">Mentor</p>
                <h3>{skill.mentorName}</h3>
                <p>
                  {skill.mentorBadge} mentor
                  {skill.sessionsCompleted !== null ? ` with ${skill.sessionsCompleted} completed sessions.` : "."}
                </p>
              </div>
              <div className="mockup-panel accent-green">
                <p className="eyebrow">Trust</p>
                <h3>{skill.trustScore}/100</h3>
                <p>
                  {skill.mentorRating !== null
                    ? `${skill.mentorRating} rating from completed learners.`
                    : "Verified by platform governance."}
                </p>
              </div>
              <div className="mockup-panel wide accent-orange">
                <p className="eyebrow">What learners get</p>
                <h3>Practical output, review, and reusable template</h3>
                <p>Designed for local learners and UMKM workflows, with token settlement after session completion.</p>
              </div>
            </div>
          </div>
        </article>

        <aside className="project-card accent-orange">
          <p className="eyebrow">Booking</p>
          <h2 className="card-title">Reserve a session</h2>

          {bookingError === "self-blocked" && (
            <p className="auth-error mb-3">You cannot book your own class.</p>
          )}
          {bookingError === "learner-only" && (
            <p className="auth-error mb-3">Switch to a learner account to book sessions.</p>
          )}
          {bookingError === "insufficient-tokens" && (
            <p className="auth-error mb-3">You don't have enough tokens for this booking.</p>
          )}
          {bookingError === "already-booked" && (
            <p className="auth-error mb-3">You already have an active booking for this class.</p>
          )}

          <div className="mb-5 grid gap-3">
            <span className="flex items-center gap-2">
              <Coins size={18} className="text-fin-orange" />
              {skill.priceToken} token
            </span>
            {skill.mentorRating !== null && (
              <span className="flex items-center gap-2">
                <Star size={18} className="text-report-blue" />
                {skill.mentorRating} mentor rating
              </span>
            )}
            <span className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-report-green" />
              Tokens release after completion
            </span>
          </div>

          {!user ? (
            <Link className="button-primary" href="/login">Log in to book</Link>
          ) : user.id === skill.mentorId ? (
            <p className="rounded-lg border-2 border-hairline bg-canvas p-4 text-sm text-ink-muted">
              This is your own class — booking is disabled by platform governance.
            </p>
          ) : user.role !== "learner" && user.role !== "admin" ? (
            <p className="rounded-lg border-2 border-hairline bg-canvas p-4 text-sm text-ink-muted">
              Switch to a learner account to book sessions with tokens.
            </p>
          ) : (
            <form className="grid gap-3" action="/api/bookings" method="post">
              <input type="hidden" name="skillId" value={skill.id} />

              <div className="rounded-lg border border-hairline bg-canvas p-4 text-sm grid gap-1">
                <p>Cost: <strong>{skill.priceToken} tokens</strong></p>
                <p>Your balance: <strong>{user.tokenBalance} tokens</strong></p>
                {!hasEnoughTokens && (
                  <p className="flex items-center gap-1 text-red-500 font-medium mt-1">
                    <AlertCircle size={14} />
                    Insufficient token balance.
                  </p>
                )}
              </div>

              <label className="grid gap-2 text-sm font-medium">
                Schedule
                <select className="rounded-lg border border-hairline bg-white px-3 py-3" name="scheduleTime">
                  {schedule.map((slot) => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
              </label>

              <button
                className="button-primary"
                type="submit"
                disabled={!hasEnoughTokens}
              >
                <CalendarCheck size={16} />
                Book with tokens
              </button>
            </form>
          )}
        </aside>
      </section>
    </PlatformShell>
  );
}
