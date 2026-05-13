import Link from "next/link";
import { BadgeCheck, MapPin, Star, Users } from "lucide-react";
import { seedSkills } from "@skill-loop/domain";
import { PageIntro, PlatformShell } from "../_components/shell";

export default function MarketplacePage() {
  const categories = Array.from(new Set(seedSkills.map((skill) => skill.category)));

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
          <span className="badge orange">All skills</span>
          {categories.map((category) => (
            <span className="badge blue" key={category}>{category}</span>
          ))}
        </div>
        <div className="market-grid">
          {seedSkills.map((skill) => (
            <article className="project-card" key={skill.id}>
              <div className="mb-5 flex items-start justify-between gap-4">
                <p className="eyebrow">{skill.category}</p>
                <span className="badge green">{skill.mode}</span>
              </div>
              <h2 className="card-title">{skill.title}</h2>
              <p>{skill.description}</p>
              <div className="meta-row">
                <span className="badge orange">{skill.priceToken} token</span>
                <span className="badge blue"><MapPin size={13} /> {skill.location}</span>
              </div>
              <div className="mb-5 grid gap-2 rounded-lg bg-canvas p-4 text-sm text-ink-muted">
                <span className="flex items-center gap-2 text-ink">
                  <BadgeCheck size={16} className="text-report-green" />
                  {skill.mentorName} · {skill.mentorBadge}
                </span>
                <span className="flex items-center gap-2">
                  <Star size={16} className="text-fin-orange" />
                  {skill.mentorRating} rating
                </span>
                <span className="flex items-center gap-2">
                  <Users size={16} className="text-report-blue" />
                  {skill.sessionsCompleted} completed sessions
                </span>
              </div>
              <Link className="button-primary w-full" href={`/marketplace/${skill.id}`}>
                View and book
              </Link>
            </article>
          ))}
        </div>
      </section>
    </PlatformShell>
  );
}
