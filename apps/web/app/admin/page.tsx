import Link from "next/link";
import { Database, ShieldCheck, UserX } from "lucide-react";
import { count, eq } from "drizzle-orm";
import { db, users, skills } from "@skill-loop/db";
import { seedGovernanceRules, seedProjects, seedSkills } from "@skill-loop/domain";
import { requireUser } from "../_lib/auth";
import { PageIntro, PlatformShell } from "../_components/shell";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ seed?: string; users?: string; skills?: string }>;
}) {
  await requireUser(["admin"]);
  const params = await searchParams;

  type MentorRow = { id: string; name: string; trustScore: number };
  let mentorList: MentorRow[] = [];

  let dbUserCount = 0;
  let dbSkillCount = 0;

  if (process.env.POSTGRES_URL) {
    mentorList = await db
      .select({ id: users.id, name: users.name, trustScore: users.trustScore })
      .from(users)
      .where(eq(users.role, "mentor"));

    const [uc] = await db.select({ n: count() }).from(users);
    const [sc] = await db.select({ n: count() }).from(skills);
    dbUserCount = uc?.n ?? 0;
    dbSkillCount = sc?.n ?? 0;
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

        {/* ── Seed database ───────────────────────────────────────────── */}
        <article className="product-card col-span-2 max-[900px]:col-span-1">
          <div className="panel-header">
            <h2 className="card-title">Database seeding</h2>
            <Database size={20} />
          </div>

          {params.seed === "done" && (
            <p className="auth-success mb-4">
              Seed berhasil! {params.users} user dan {params.skills} kelas contoh ditambahkan ke database.
            </p>
          )}
          {params.seed === "partial" && (
            <p className="auth-error mb-4">
              Seed sebagian berhasil — beberapa data mungkin sudah ada sebelumnya.
            </p>
          )}
          {params.seed === "demo-mode" && (
            <p className="auth-error mb-4">Seed memerlukan koneksi database nyata.</p>
          )}

          {!process.env.POSTGRES_URL ? (
            <p className="text-sm text-muted">
              Fitur ini memerlukan koneksi database (<code className="rounded bg-canvas px-1 py-0.5 text-xs">POSTGRES_URL</code>).
              Saat ini berjalan dalam seed/demo mode.
            </p>
          ) : (
            <div className="grid gap-4">
              {/* Status */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl border-[3px] border-hairline bg-canvas p-4 text-center">
                  <p className="text-2xl font-bold">{dbUserCount}</p>
                  <p className="text-sm text-muted">Users di DB</p>
                </div>
                <div className="rounded-xl border-[3px] border-hairline bg-canvas p-4 text-center">
                  <p className="text-2xl font-bold">{dbSkillCount}</p>
                  <p className="text-sm text-muted">Kelas di DB</p>
                </div>
                <div className="rounded-xl border-[3px] border-hairline bg-canvas p-4 text-center">
                  <p className={`text-2xl font-bold ${dbSkillCount > 0 ? "text-report-green" : "text-fin-orange"}`}>
                    {dbSkillCount > 0 ? "✓ Ready" : "Kosong"}
                  </p>
                  <p className="text-sm text-muted">Status marketplace</p>
                </div>
              </div>

              <div className="rounded-xl border-[3px] border-hairline bg-canvas p-4 text-sm grid gap-2">
                <p className="font-medium">Yang akan di-seed:</p>
                <ul className="text-ink-muted grid gap-1">
                  <li>• 7 demo user (learner, 4 mentor, business, admin) — password: <code className="rounded bg-surface-1 px-1">skillloop123</code></li>
                  <li>• 4 kelas contoh (Design, Business, Career, Coding)</li>
                  <li>• Data yang sudah ada di-skip otomatis (aman dijalankan berulang)</li>
                </ul>
              </div>

              <form action="/api/seed" method="post">
                <button className="button-fin" type="submit">
                  <Database size={16} />
                  Seed database sekarang
                </button>
              </form>

              <div className="text-sm text-muted">
                Setelah seed, login dengan akun demo di halaman{" "}
                <Link href="/login" className="underline">Login</Link>:
                <span className="ml-1 font-mono text-xs">learner@skillloop.test / skillloop123</span>
              </div>
            </div>
          )}
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
