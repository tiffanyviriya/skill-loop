import Link from "next/link";
import { and, desc, eq, inArray } from "drizzle-orm";
import { BadgeCheck, BookOpen, CalendarCheck, MapPin, Send, Star, Users } from "lucide-react";
import { db, skills, users, bookings, projectApplications, businessProjects } from "@skill-loop/db";
import { seedSkills, seedBookings } from "@skill-loop/domain";
import { getCurrentUser } from "../_lib/auth";
import { PageIntro, PlatformShell } from "../_components/shell";

// ─── Types ───────────────────────────────────────────────────────────────────

type DisplaySkill = {
  id: string;
  title: string;
  description: string;
  category: string;
  priceToken: number;
  mode: string;
  location: string | null;
  mentorName: string;
  mentorBadge: string;
  mentorRating: number | null;
  sessionsCompleted: number | null;
};

type MyBooking = {
  id: string;
  skillTitle: string;
  mentorName: string;
  scheduleTime: string;
  status: string;
  priceToken: number;
};

type MyApplication = {
  id: string;
  projectTitle: string;
  businessName: string;
  requiredSkill: string;
  rewardToken: number;
  status: string;
  proposal: string;
};

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; tab?: string }>;
}) {
  const params = await searchParams;
  const activeCategory = params.category ?? null;
  const activeTab = params.tab ?? "all"; // "all" | "bookings" | "applications"

  const user = await getCurrentUser();

  // ── All Skills ──────────────────────────────────────────────────────────
  let displaySkills: DisplaySkill[] = [];
  let categories: string[] = [];

  // Helper to map seed skills → DisplaySkill
  const seedToDisplay = (s: typeof seedSkills[number]): DisplaySkill => ({
    id: s.id,
    title: s.title,
    description: s.description,
    category: s.category,
    priceToken: s.priceToken,
    mode: s.mode,
    location: s.location,
    mentorName: s.mentorName,
    mentorBadge: s.mentorBadge,
    mentorRating: s.mentorRating,
    sessionsCompleted: s.sessionsCompleted,
  });

  if (!process.env.POSTGRES_URL) {
    const filtered = activeCategory
      ? seedSkills.filter((s) => s.category === activeCategory)
      : seedSkills;
    displaySkills = filtered.map(seedToDisplay);
    categories = [...new Set(seedSkills.map((s) => s.category))];
  } else {
    const query = db
      .select({
        id: skills.id,
        title: skills.title,
        description: skills.description,
        category: skills.category,
        priceToken: skills.priceToken,
        mode: skills.mode,
        location: skills.location,
        mentorName: users.name,
        mentorVerified: users.verified,
      })
      .from(skills)
      .innerJoin(users, eq(skills.mentorId, users.id));

    const rows = activeCategory
      ? await query.where(eq(skills.category, activeCategory))
      : await query;

    // If DB is empty, fall back to seed examples so marketplace is never blank
    if (rows.length === 0 && !activeCategory) {
      displaySkills = seedSkills.map(seedToDisplay);
      categories = [...new Set(seedSkills.map((s) => s.category))];
    } else {
      displaySkills = rows.map((r) => ({
        id: r.id,
        title: r.title,
        description: r.description,
        category: r.category,
        priceToken: r.priceToken,
        mode: r.mode,
        location: r.location,
        mentorName: r.mentorName,
        mentorBadge: r.mentorVerified ? "verified" : "community",
        mentorRating: null,
        sessionsCompleted: null,
      }));

      const catRows = await db.selectDistinct({ category: skills.category }).from(skills);
      categories = catRows.map((r) => r.category);
    }
  }

  // ── My Bookings ─────────────────────────────────────────────────────────
  let myBookings: MyBooking[] = [];

  if (user && activeTab === "bookings") {
    if (!process.env.POSTGRES_URL) {
      myBookings = seedBookings
        .filter((b) => b.learnerName === user.name)
        .map((b) => ({
          id: b.id,
          skillTitle: b.skillTitle,
          mentorName: b.mentorName,
          scheduleTime: b.scheduleTime,
          status: b.status,
          priceToken: b.priceToken,
        }));
    } else {
      const raw = await db
        .select({
          id: bookings.id,
          status: bookings.status,
          scheduleTime: bookings.scheduleTime,
          skillTitle: skills.title,
          skillPrice: skills.priceToken,
          mentorId: bookings.mentorId,
        })
        .from(bookings)
        .innerJoin(skills, eq(bookings.skillId, skills.id))
        .where(eq(bookings.learnerId, user.id))
        .orderBy(desc(bookings.createdAt));

      const mentorIds = [...new Set(raw.map((b) => b.mentorId))];
      const mentorList = mentorIds.length > 0
        ? await db.select({ id: users.id, name: users.name }).from(users).where(inArray(users.id, mentorIds))
        : [];
      const mentorMap = Object.fromEntries(mentorList.map((m) => [m.id, m.name]));

      myBookings = raw.map((b) => ({
        id: b.id,
        skillTitle: b.skillTitle,
        mentorName: mentorMap[b.mentorId] ?? "—",
        scheduleTime: b.scheduleTime instanceof Date
          ? b.scheduleTime.toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })
          : String(b.scheduleTime),
        status: b.status,
        priceToken: b.skillPrice,
      }));
    }
  }

  // ── My Applications ─────────────────────────────────────────────────────
  let myApplications: MyApplication[] = [];

  if (user && activeTab === "applications") {
    if (process.env.POSTGRES_URL) {
      const raw = await db
        .select({
          id: projectApplications.id,
          projectTitle: businessProjects.title,
          businessId: businessProjects.businessId,
          requiredSkill: businessProjects.requiredSkill,
          rewardToken: businessProjects.rewardToken,
          status: projectApplications.status,
          proposal: projectApplications.proposal,
        })
        .from(projectApplications)
        .innerJoin(businessProjects, eq(projectApplications.projectId, businessProjects.id))
        .where(eq(projectApplications.applicantId, user.id))
        .orderBy(desc(projectApplications.createdAt));

      const bizIds = [...new Set(raw.map((r) => r.businessId))];
      const bizList = bizIds.length > 0
        ? await db.select({ id: users.id, name: users.name }).from(users).where(inArray(users.id, bizIds))
        : [];
      const bizMap = Object.fromEntries(bizList.map((b) => [b.id, b.name]));

      myApplications = raw.map((r) => ({
        id: r.id,
        projectTitle: r.projectTitle,
        businessName: bizMap[r.businessId] ?? "—",
        requiredSkill: r.requiredSkill,
        rewardToken: r.rewardToken,
        status: r.status,
        proposal: r.proposal,
      }));
    }
  }

  const isLoggedIn = !!user;

  return (
    <PlatformShell>
      <PageIntro
        eyebrow="Skill Marketplace"
        title="Book classes, mentoring, workshops, and consultations."
        description="Browse local mentors, compare token prices, and choose an online or offline schedule."
        action={<Link className="button-fin" href="/dashboard/mentor">Create class</Link>}
      />

      <section className="container pb-24">

        {/* ── Tab navigator ─────────────────────────────────────────────── */}
        <div className="mb-6 flex flex-wrap items-center gap-2 border-b-2 border-hairline pb-4">
          <Link
            href="/marketplace"
            className={activeTab === "all" ? "badge orange" : "badge blue"}
          >
            All skills
          </Link>
          {isLoggedIn && (
            <>
              <Link
                href="/marketplace?tab=bookings"
                className={`badge flex items-center gap-1 ${activeTab === "bookings" ? "orange" : "blue"}`}
              >
                <BookOpen size={12} />
                Your bookings
              </Link>
              <Link
                href="/marketplace?tab=applications"
                className={`badge flex items-center gap-1 ${activeTab === "applications" ? "orange" : "blue"}`}
              >
                <Send size={12} />
                Your UMKM applications
              </Link>
            </>
          )}
        </div>

        {/* ── All Skills view ────────────────────────────────────────────── */}
        {activeTab === "all" && (
          <>
            <div className="mb-6 flex flex-wrap gap-2">
              <Link href="/marketplace" className={!activeCategory ? "badge orange" : "badge blue"}>
                All categories
              </Link>
              {categories.map((category) => (
                <Link
                  href={`/marketplace?category=${encodeURIComponent(category)}`}
                  className={activeCategory === category ? "badge orange" : "badge blue"}
                  key={category}
                >
                  {category}
                </Link>
              ))}
            </div>

            {displaySkills.length === 0 ? (
              <p className="text-sm text-muted">
                No classes found for this category.{" "}
                <Link href="/marketplace" className="underline">View all</Link>.
              </p>
            ) : (
              <div className="market-grid">
                {displaySkills.map((skill) => (
                  <article className="project-card" key={skill.id}>
                    <div className="mb-5 flex items-start justify-between gap-4">
                      <p className="eyebrow">{skill.category}</p>
                      <span className="badge green">{skill.mode}</span>
                    </div>
                    <h2 className="card-title">{skill.title}</h2>
                    <p>{skill.description}</p>
                    <div className="meta-row">
                      <span className="badge orange">{skill.priceToken} token</span>
                      <span className="badge blue"><MapPin size={13} /> {skill.location ?? "Online"}</span>
                    </div>
                    <div className="mb-5 grid gap-2 rounded-lg bg-canvas p-4 text-sm text-ink-muted">
                      <span className="flex items-center gap-2 text-ink">
                        <BadgeCheck size={16} className="text-report-green" />
                        {skill.mentorName} · {skill.mentorBadge}
                      </span>
                      {skill.mentorRating !== null && (
                        <span className="flex items-center gap-2">
                          <Star size={16} className="text-fin-orange" />
                          {skill.mentorRating} rating
                        </span>
                      )}
                      {skill.sessionsCompleted !== null && (
                        <span className="flex items-center gap-2">
                          <Users size={16} className="text-report-blue" />
                          {skill.sessionsCompleted} completed sessions
                        </span>
                      )}
                    </div>
                    <Link className="button-primary w-full" href={`/marketplace/${skill.id}`}>
                      View and book
                    </Link>
                  </article>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── Your Bookings view ─────────────────────────────────────────── */}
        {activeTab === "bookings" && (
          <div>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="eyebrow">Your marketplace</p>
                <h2 className="card-title">Booked classes</h2>
              </div>
              <Link className="button-primary" href="/marketplace">Browse more classes</Link>
            </div>

            {myBookings.length === 0 ? (
              <div className="rounded-xl border-[3px] border-hairline bg-surface-1 p-12 text-center">
                <BookOpen size={40} className="mx-auto mb-4 text-ink-muted" />
                <p className="text-muted mb-5">You haven&apos;t booked any classes yet.</p>
                <Link className="button-primary" href="/marketplace">Browse classes</Link>
              </div>
            ) : (
              <div className="grid gap-3">
                {myBookings.map((booking) => (
                  <div className="list-row" key={booking.id}>
                    <div className="min-w-0 flex-1">
                      <strong>{booking.skillTitle}</strong>
                      <p className="text-sm text-muted">{booking.mentorName} · {booking.scheduleTime}</p>
                    </div>
                    <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
                      <span className="badge orange">{booking.priceToken} token</span>
                      <span className={
                        booking.status === "completed" ? "badge green" :
                        booking.status === "cancelled" ? "badge orange" :
                        "badge blue"
                      }>{booking.status}</span>
                      <Link className="badge blue flex items-center gap-1" href="/dashboard/learner">
                        <CalendarCheck size={12} />
                        Dashboard
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Your Applications view ─────────────────────────────────────── */}
        {activeTab === "applications" && (
          <div>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="eyebrow">Your marketplace</p>
                <h2 className="card-title">UMKM project applications</h2>
              </div>
              <Link className="button-primary" href="/projects">Browse projects</Link>
            </div>

            {myApplications.length === 0 ? (
              <div className="rounded-xl border-[3px] border-hairline bg-surface-1 p-12 text-center">
                <Send size={40} className="mx-auto mb-4 text-ink-muted" />
                <p className="text-muted mb-5">
                  {!process.env.POSTGRES_URL
                    ? "Demo mode — project applications are not stored. Connect a database to track applications."
                    : "You haven't applied to any UMKM projects yet."}
                </p>
                <Link className="button-primary" href="/projects">Browse projects</Link>
              </div>
            ) : (
              <div className="grid gap-3">
                {myApplications.map((app) => (
                  <div className="list-row" key={app.id}>
                    <div className="min-w-0 flex-1">
                      <strong>{app.projectTitle}</strong>
                      <p className="text-sm text-muted">{app.businessName} · {app.requiredSkill}</p>
                      <p className="mt-1.5 line-clamp-2 text-sm text-ink-muted">&ldquo;{app.proposal}&rdquo;</p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <span className="badge orange">{app.rewardToken} token reward</span>
                      <span className={
                        app.status === "accepted" ? "badge green" :
                        app.status === "shortlisted" ? "badge blue" :
                        app.status === "rejected" ? "badge orange" :
                        "badge blue"
                      }>{app.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </section>
    </PlatformShell>
  );
}
