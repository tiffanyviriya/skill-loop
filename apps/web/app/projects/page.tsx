import Link from "next/link";
import { and, count, desc, eq, inArray } from "drizzle-orm";
import { Building2, Send } from "lucide-react";
import { db, businessProjects, projectApplications, users } from "@skill-loop/db";
import { seedProjects } from "@skill-loop/domain";
import { getCurrentUser } from "../_lib/auth";
import { PageIntro, PlatformShell } from "../_components/shell";

type ProjectDisplay = {
  id: string;
  businessName: string;
  title: string;
  description: string;
  requiredSkill: string;
  rewardToken: number;
  applicants: number;
  status: string;
};

type AppDisplay = {
  id: string;
  projectId: string;
  projectTitle: string;
  applicantName: string;
  proposal: string;
  status: string;
};

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ applied?: string; created?: string; updated?: string; error?: string; mode?: string }>;
}) {
  const user = await getCurrentUser();
  const params = await searchParams;

  let projectList: ProjectDisplay[] = [];
  let myApplications: AppDisplay[] = [];

  if (!process.env.POSTGRES_URL) {
    projectList = seedProjects.map((p) => ({
      id: p.id,
      businessName: p.businessName,
      title: p.title,
      description: p.description,
      requiredSkill: p.requiredSkill,
      rewardToken: p.rewardToken,
      applicants: p.applicants,
      status: p.status,
    }));
  } else {
    const rows = await db
      .select({
        id: businessProjects.id,
        businessId: businessProjects.businessId,
        title: businessProjects.title,
        description: businessProjects.description,
        requiredSkill: businessProjects.requiredSkill,
        rewardToken: businessProjects.rewardToken,
        status: businessProjects.status,
      })
      .from(businessProjects)
      .where(inArray(businessProjects.status, ["open", "in_review"]))
      .orderBy(desc(businessProjects.createdAt));

    const counts = await db
      .select({ projectId: projectApplications.projectId, total: count() })
      .from(projectApplications)
      .groupBy(projectApplications.projectId);
    const countMap = Object.fromEntries(counts.map((c) => [c.projectId, c.total]));

    const businessIds = [...new Set(rows.map((r) => r.businessId))];
    const businesses = businessIds.length > 0
      ? await db.select({ id: users.id, name: users.name }).from(users).where(inArray(users.id, businessIds))
      : [];
    const businessMap = Object.fromEntries(businesses.map((b) => [b.id, b.name]));

    projectList = rows.map((r) => ({
      id: r.id,
      businessName: businessMap[r.businessId] ?? "Business",
      title: r.title,
      description: r.description,
      requiredSkill: r.requiredSkill,
      rewardToken: r.rewardToken,
      applicants: countMap[r.id] ?? 0,
      status: r.status,
    }));

    if (user?.role === "business" || user?.role === "admin") {
      const apps = await db
        .select({
          id: projectApplications.id,
          projectId: projectApplications.projectId,
          projectTitle: businessProjects.title,
          applicantName: users.name,
          proposal: projectApplications.proposal,
          status: projectApplications.status,
        })
        .from(projectApplications)
        .innerJoin(businessProjects, and(
          eq(projectApplications.projectId, businessProjects.id),
          eq(businessProjects.businessId, user.id)
        ))
        .innerJoin(users, eq(projectApplications.applicantId, users.id))
        .orderBy(desc(projectApplications.createdAt));

      myApplications = apps;
    }
  }

  const isOwner = user?.role === "business" || user?.role === "admin";

  return (
    <PlatformShell>
      <PageIntro
        eyebrow="Community Project Board"
        title="UMKM projects that need local skill and trusted talent."
        description="Businesses post project needs, mentors and learners apply, and token rewards create local economic loops."
        action={isOwner ? <span className="badge green">Project owner mode</span> : null}
      />

      <section className="container grid grid-cols-[1fr_360px] gap-4 pb-24 max-[900px]:grid-cols-1">
        <div>
          {(params.applied && params.applied !== "business-blocked") && (
            <p className="auth-success mb-4">Application submitted successfully!</p>
          )}
          {params.applied === "business-blocked" && (
            <p className="auth-error mb-4">Business accounts cannot apply to projects.</p>
          )}
          {params.error === "no-proposal" && (
            <p className="auth-error mb-4">Please write a proposal before applying.</p>
          )}
          {params.error === "already-applied" && (
            <p className="auth-error mb-4">Kamu sudah pernah melamar ke proyek ini.</p>
          )}
          {params.error === "project-not-found" && (
            <p className="auth-error mb-4">Proyek tidak ditemukan.</p>
          )}
          {params.updated === "1" && (
            <p className="auth-success mb-4">Applicant status updated.</p>
          )}

          <div className="project-grid">
            {projectList.length === 0 ? (
              <p className="text-sm text-muted">No open projects yet.</p>
            ) : (
              projectList.map((project) => (
                <article className="project-card" key={project.id}>
                  <span className="icon-chip"><Building2 size={22} /></span>
                  <p className="eyebrow">{project.businessName}</p>
                  <h2 className="card-title">{project.title}</h2>
                  <p>{project.description}</p>
                  <div className="meta-row">
                    <span className="badge pink">{project.requiredSkill}</span>
                    <span className="badge orange">{project.rewardToken} token</span>
                    <span className="badge blue">{project.applicants} applicants</span>
                  </div>
                  {!user ? (
                    <Link className="button-primary" href="/login">Log in to apply</Link>
                  ) : isOwner ? (
                    <p className="text-sm text-muted">You own this board — switch to a learner or mentor account to apply.</p>
                  ) : (
                    <form className="grid gap-2" action="/api/projects/applications" method="post">
                      <input type="hidden" name="projectId" value={project.id} />
                      <textarea
                        className="min-h-20 w-full rounded-lg border border-hairline px-3 py-3 text-sm"
                        name="proposal"
                        placeholder="Describe your experience and how you can help with this project..."
                        required
                      />
                      <button className="button-primary" type="submit">
                        <Send size={16} />
                        Apply to project
                      </button>
                    </form>
                  )}
                </article>
              ))
            )}
          </div>

          {isOwner && (
            <div className="product-card mt-4">
              <div className="panel-header">
                <h2 className="card-title">Applicant pipeline</h2>
                <span className="badge blue">your projects</span>
              </div>
              {!process.env.POSTGRES_URL ? (
                <div className="pipeline">
                  <div><strong>Submitted</strong><p>10 mentors</p></div>
                  <div><strong>Shortlisted</strong><p>4 mentors</p></div>
                  <div><strong>Accepted</strong><p>1 project</p></div>
                </div>
              ) : myApplications.length === 0 ? (
                <p className="text-sm text-muted px-1">No applications yet for your projects.</p>
              ) : (
                <div className="list-stack">
                  {myApplications.map((app) => (
                    <div className="list-row" key={app.id}>
                      <div className="flex-1 min-w-0">
                        <strong>{app.applicantName}</strong>
                        <p className="text-xs text-muted">{app.projectTitle}</p>
                        <p className="text-sm mt-1 line-clamp-2">{app.proposal}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <span className={
                          app.status === "accepted" ? "badge green" :
                          app.status === "shortlisted" ? "badge blue" :
                          app.status === "rejected" ? "badge orange" : "badge blue"
                        }>{app.status}</span>
                        {app.status === "submitted" && (
                          <form action={`/api/projects/applications/${app.id}`} method="post">
                            <input type="hidden" name="status" value="shortlisted" />
                            <button className="badge blue" type="submit">Shortlist</button>
                          </form>
                        )}
                        {(app.status === "submitted" || app.status === "shortlisted") && (
                          <form action={`/api/projects/applications/${app.id}`} method="post">
                            <input type="hidden" name="status" value="accepted" />
                            <button className="badge green" type="submit">Accept</button>
                          </form>
                        )}
                        {app.status !== "rejected" && app.status !== "accepted" && (
                          <form action={`/api/projects/applications/${app.id}`} method="post">
                            <input type="hidden" name="status" value="rejected" />
                            <button className="badge orange" type="submit">Reject</button>
                          </form>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <aside className="project-card accent-orange">
          <p className="eyebrow">Post a project</p>
          <h2 className="card-title">Find local talent</h2>
          {params.created === "1" && <p className="auth-success mb-3">Project posted successfully!</p>}
          {params.created === "seed-demo" && <p className="auth-error mb-3">Posting requires a database connection.</p>}
          {isOwner ? (
            <form className="grid gap-3" action="/api/projects" method="post">
              <input className="rounded-lg border border-hairline px-3 py-3" name="title" placeholder="Project title" required />
              <input className="rounded-lg border border-hairline px-3 py-3" name="requiredSkill" placeholder="Required skill" required />
              <textarea className="min-h-28 rounded-lg border border-hairline px-3 py-3" name="description" placeholder="Project description" required />
              <input className="rounded-lg border border-hairline px-3 py-3" name="rewardToken" type="number" min="1" placeholder="Reward token" required />
              <button className="button-fin" type="submit">Post project</button>
            </form>
          ) : (
            <div className="grid gap-3">
              <p className="text-sm leading-6 text-ink-muted">Log in as an UMKM / business account to post project needs and manage applicants.</p>
              <Link className="button-primary" href="/login">Log in as business</Link>
            </div>
          )}
        </aside>
      </section>
    </PlatformShell>
  );
}
