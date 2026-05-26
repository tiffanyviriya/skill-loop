import { ShieldCheck, UserX } from "lucide-react";
import { eq } from "drizzle-orm";
import { db, users } from "@skill-loop/db";
import { seedGovernanceRules, seedProjects, seedSkills } from "@skill-loop/domain";
import { requireUser } from "../_lib/auth";
import { PageIntro, PlatformShell } from "../_components/shell";

export default async function AdminPage() {
  await requireUser(["admin"]);

  type MentorRow = { id: string; name: string; trustScore: number };
  let mentorList: MentorRow[] = [];

  if (process.env.POSTGRES_URL) {
    mentorList = await db
      .select({ id: users.id, name: users.name, trustScore: users.trustScore })
      .from(users)
      .where(eq(users.role, "mentor"));
  }

  return (
    <PlatformShell>
      <PageIntro
        eyebrow="Admin governance"
        title="Moderate trust, verification, reports, and platform rules."
        description="Admin controls protect the multi-sided ecosystem from self-booking, fake reviews, unsafe projects, and low-trust accounts."
      />

      <section className="container grid grid-cols-2 gap-4 pb-24 max-[900px]:grid-cols-1">
        <article className="product-card">
          <div className="panel-header">
            <h2 className="card-title">Mentor verification</h2>
            <ShieldCheck size={22} />
          </div>
          <div className="list-stack">
            {process.env.POSTGRES_URL ? (
              mentorList.length === 0 ? (
                <p className="text-sm text-muted px-1">No mentors registered yet.</p>
              ) : (
                mentorList.map((mentor) => {
                  const isVerified = mentor.trustScore >= 90;
                  return (
                    <div className="list-row" key={mentor.id}>
                      <div>
                        <strong>{mentor.name}</strong>
                        <p>trust {mentor.trustScore}</p>
                      </div>
                      <form action="/api/admin/mentor-verification" method="post">
                        <input type="hidden" name="mentorId" value={mentor.id} />
                        <button className={isVerified ? "badge green" : "badge orange"} type="submit">
                          {isVerified ? "verified" : "community"}
                        </button>
                      </form>
                    </div>
                  );
                })
              )
            ) : (
              seedSkills.map((skill) => (
                <div className="list-row" key={skill.mentorId}>
                  <div>
                    <strong>{skill.mentorName}</strong>
                    <p>{skill.sessionsCompleted} sessions · trust {skill.trustScore}</p>
                  </div>
                  <form action="/api/admin/mentor-verification" method="post">
                    <input type="hidden" name="mentorId" value={skill.mentorId} />
                    <button className={skill.mentorBadge === "verified" ? "badge green" : "badge orange"} type="submit">
                      {skill.mentorBadge}
                    </button>
                  </form>
                </div>
              ))
            )}
          </div>
        </article>

        <article className="product-card">
          <div className="panel-header">
            <h2 className="card-title">Project moderation</h2>
            <UserX size={22} />
          </div>
          <div className="list-stack">
            {seedProjects.map((project) => (
              <div className="list-row" key={project.id}>
                <div>
                  <strong>{project.title}</strong>
                  <p>{project.businessName} · {project.status}</p>
                </div>
                <span className="badge blue">{project.applicants} applicants</span>
              </div>
            ))}
          </div>
        </article>

        <article className="cta-banner col-span-2 max-[900px]:col-span-1">
          <div>
            <p className="eyebrow">Rules implemented in the surface</p>
            <h2>Trust is part of the product loop.</h2>
            <p className="lead">Review after completion, release mentor tokens after completion, prevent mentor self-booking, and scope UMKM applicants to project owners.</p>
          </div>
        </article>
        <article className="product-card col-span-2 max-[900px]:col-span-1">
          <div className="panel-header">
            <h2 className="card-title">Rule engine preview</h2>
            <span className="badge orange">policy monitor</span>
          </div>
          <div className="feature-grid">
            {seedGovernanceRules.map((rule) => (
              <div className="feature-card" key={rule.title}>
                <p className="eyebrow">{rule.status}</p>
                <h3>{rule.title}</h3>
                <p>{rule.detail}</p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </PlatformShell>
  );
}
