import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarCheck, Coins, ShieldCheck, Star } from "lucide-react";
import { getSkillById } from "@skill-loop/domain";
import { PageIntro, PlatformShell } from "../../_components/shell";

export default async function SkillDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const skill = getSkillById(id);

  if (!skill) {
    notFound();
  }

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
                <p>{skill.mentorBadge} mentor with {skill.sessionsCompleted} completed sessions.</p>
              </div>
              <div className="mockup-panel accent-green">
                <p className="eyebrow">Trust</p>
                <h3>{skill.trustScore}/100</h3>
                <p>{skill.mentorRating} rating from completed learners.</p>
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
          <div className="mb-5 grid gap-3">
            <span className="flex items-center gap-2"><Coins size={18} className="text-fin-orange" /> {skill.priceToken} token</span>
            <span className="flex items-center gap-2"><Star size={18} className="text-report-blue" /> {skill.mentorRating} mentor rating</span>
            <span className="flex items-center gap-2"><ShieldCheck size={18} className="text-report-green" /> Tokens release after completion</span>
          </div>
          <form className="grid gap-3" action="/api/bookings" method="post">
            <input type="hidden" name="skillId" value={skill.id} />
            <label className="grid gap-2 text-sm font-medium">
              Schedule
              <select className="rounded-lg border border-hairline bg-white px-3 py-3" name="scheduleTime">
                {skill.schedule.map((schedule) => (
                  <option key={schedule} value={schedule}>{schedule}</option>
                ))}
              </select>
            </label>
            <button className="button-primary" type="submit">
              <CalendarCheck size={16} />
              Book with tokens
            </button>
          </form>
        </aside>
      </section>
    </PlatformShell>
  );
}
