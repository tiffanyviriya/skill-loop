import Link from "next/link";
import { eq } from "drizzle-orm";
import { BadgeCheck, MapPin, Star, Users } from "lucide-react";
import { db, skills, users } from "@skill-loop/db";
import { seedSkills } from "@skill-loop/domain";
import { PageIntro, PlatformShell } from "../_components/shell";

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

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const params = await searchParams;
  const activeCategory = params.category ?? null;

  let displaySkills: DisplaySkill[] = [];
  let categories: string[] = [];

  if (!process.env.POSTGRES_URL) {
    const filtered = activeCategory
      ? seedSkills.filter((s) => s.category === activeCategory)
      : seedSkills;
    displaySkills = filtered.map((s) => ({
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
    }));
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
        mentorTrustScore: users.trustScore,
      })
      .from(skills)
      .innerJoin(users, eq(skills.mentorId, users.id));

    const rows = activeCategory
      ? await query.where(eq(skills.category, activeCategory))
      : await query;

    displaySkills = rows.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      category: r.category,
      priceToken: r.priceToken,
      mode: r.mode,
      location: r.location,
      mentorName: r.mentorName,
      mentorBadge: r.mentorTrustScore >= 90 ? "verified" : "community",
      mentorRating: null,
      sessionsCompleted: null,
    }));

    const catRows = await db.selectDistinct({ category: skills.category }).from(skills);
    categories = catRows.map((r) => r.category);
  }

  return (
    <PlatformShell>
      <PageIntro
        eyebrow="Skill Marketplace"
        title="Book classes, mentoring, workshops, and consultations."
        description="Browse local mentors, compare token prices, and choose an online or offline schedule."
        action={<Link className="button-fin" href="/dashboard/mentor">Create class</Link>}
      />

      <section className="container pb-24">
        <div className="mb-6 flex flex-wrap gap-2">
          <Link
            href="/marketplace"
            className={!activeCategory ? "badge orange" : "badge blue"}
          >
            All skills
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
          <p className="text-sm text-muted">No classes found for this category. <Link href="/marketplace" className="underline">View all</Link>.</p>
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
      </section>
    </PlatformShell>
  );
}
