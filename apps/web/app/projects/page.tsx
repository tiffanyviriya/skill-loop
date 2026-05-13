import { Building2, Send } from "lucide-react";
import { seedProjects } from "@skill-loop/domain";
import { PageIntro, PlatformShell } from "../_components/shell";

export default function ProjectsPage() {
  return (
    <PlatformShell>
      <PageIntro
        eyebrow="Community Project Board"
        title="UMKM projects that need local skill and trusted talent."
        description="Businesses post project needs, mentors apply, and token rewards create local economic loops."
      />

      <section className="container grid grid-cols-[1fr_360px] gap-4 pb-24 max-[900px]:grid-cols-1">
        <div>
          <div className="project-grid">
          {seedProjects.map((project) => (
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
              <form action="/api/projects/applications" method="post">
                <input type="hidden" name="projectId" value={project.id} />
                <button className="button-primary" type="submit">
                  <Send size={16} />
                  Apply to project
                </button>
              </form>
            </article>
          ))}
          </div>
          <div className="product-card mt-4">
            <div className="panel-header">
              <h2 className="card-title">Applicant pipeline</h2>
              <span className="badge blue">owner-only view</span>
            </div>
            <div className="pipeline">
              <div>
                <strong>Submitted</strong>
                <p>10 mentors</p>
              </div>
              <div>
                <strong>Shortlisted</strong>
                <p>4 mentors</p>
              </div>
              <div>
                <strong>Accepted</strong>
                <p>1 project</p>
              </div>
            </div>
          </div>
        </div>

        <aside className="project-card accent-orange">
          <p className="eyebrow">Post a project</p>
          <h2 className="card-title">Find local talent</h2>
          <form className="grid gap-3" action="/api/projects" method="post">
            <input className="rounded-lg border border-hairline px-3 py-3" name="title" placeholder="Project title" />
            <input className="rounded-lg border border-hairline px-3 py-3" name="requiredSkill" placeholder="Required skill" />
            <textarea className="min-h-28 rounded-lg border border-hairline px-3 py-3" name="description" placeholder="Project description" />
            <input className="rounded-lg border border-hairline px-3 py-3" name="rewardToken" placeholder="Reward token" />
            <button className="button-fin" type="submit">Post project</button>
          </form>
        </aside>
      </section>
    </PlatformShell>
  );
}
