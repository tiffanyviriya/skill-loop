import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Building2,
  CalendarCheck,
  Coins,
  Map,
  Sparkles,
  Trophy,
  ShieldCheck
} from "lucide-react";
import Link from "next/link";
import { getMarketplaceSnapshot } from "@skill-loop/domain";

export default function HomePage() {
  const snapshot = getMarketplaceSnapshot();

  return (
    <>
      <header className="top-nav">
        <Link className="brand" href="/">
          <span className="brand-mark">S</span>
          <span>Skill Loop</span>
        </Link>
        <nav className="nav-links" aria-label="Primary navigation">
          <Link href="/marketplace">Marketplace</Link>
          <Link href="/projects">UMKM Board</Link>
          <Link href="/dashboard/learner">Learner</Link>
          <Link href="/dashboard/mentor">Mentor</Link>
          <Link href="/admin">Admin</Link>
        </nav>
        <div className="nav-actions">
          <Link className="button-tertiary" href="/login">
            Log in
          </Link>
          <Link className="button-primary" href="/register">
            Sign up
          </Link>
        </div>
      </header>

      <main>
        <section className="hero container">
          <div>
            <p className="eyebrow">Community skill exchange</p>
            <h1>
              Building smarter communities through <span>shared skills.</span>
            </h1>
            <p className="hero-subhead">
              Skill Loop connects learners, mentors, UMKM teams, and community organizers in one token-powered local skill economy.
            </p>
            <div className="hero-actions">
              <Link className="button-primary" href="/marketplace">
                Explore classes <ArrowRight size={16} />
              </Link>
              <Link className="button-secondary" href="/projects">
                View UMKM projects
              </Link>
            </div>
          </div>

          <div className="product-card hero-product" aria-label="Skill Loop product preview">
            <div className="mockup-shell">
              <div className="mockup-toolbar">
                <strong>Local Skill Economy</strong>
                <span>{snapshot.stats.activeSessions} active sessions</span>
              </div>
              <div className="mockup-grid">
                <div className="mockup-panel accent-blue">
                  <p className="eyebrow">Popular class</p>
                  <h3>{snapshot.featuredSkill.title}</h3>
                  <p>
                    {snapshot.featuredSkill.priceToken} token · {snapshot.featuredSkill.mode}
                  </p>
                  <div className="chart" aria-hidden="true">
                    <span style={{ height: "42%" }} />
                    <span style={{ height: "70%" }} />
                    <span style={{ height: "54%" }} />
                    <span style={{ height: "86%" }} />
                  </div>
                </div>
                <div className="mockup-panel accent-green">
                  <p className="eyebrow">Wallet flow</p>
                  <h3>+{snapshot.stats.mentorTokensEarned} token</h3>
                  <p>Released after completed sessions</p>
                </div>
                <div className="mockup-panel wide accent-orange">
                  <p className="eyebrow">UMKM request</p>
                  <h3>{snapshot.featuredProject.title}</h3>
                  <p>
                    {snapshot.featuredProject.applicants} applicants · {snapshot.featuredProject.rewardToken} token reward
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section container">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Smart city intelligence</p>
              <h2>See where skills are needed before programs are planned.</h2>
            </div>
            <p>
              Skill Loop is also a lightweight city skill map: it shows demand, mentor supply, incentives, and gaps for local partners.
            </p>
          </div>
          <div className="platform-grid">
            <article className="product-card span-2">
              <div className="panel-header">
                <h3>Skill heatmap</h3>
                <Map size={22} />
              </div>
              <div className="heatmap-grid">
                {snapshot.heatmap.map((zone) => (
                  <div className={`heatmap-card ${zone.intensity}`} key={zone.area}>
                    <strong>{zone.area}</strong>
                    <p>{zone.demand}</p>
                    <span>{zone.supply}</span>
                  </div>
                ))}
              </div>
            </article>
            <article className="product-card">
              <div className="panel-header">
                <h3>Mentor leaderboard</h3>
                <Trophy size={22} />
              </div>
              <div className="list-stack">
                {snapshot.leaderboard.slice(0, 3).map((mentor) => (
                  <div className="list-row" key={mentor.name}>
                    <div>
                      <strong>#{mentor.rank} {mentor.name}</strong>
                      <p>{mentor.specialty} · {mentor.sessions} sessions</p>
                    </div>
                    <span className="badge green">{mentor.rating}</span>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </section>

        <section className="section container">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Platform loops</p>
              <h2>Teach, book, earn, review, repeat.</h2>
            </div>
            <p>
              The MVP follows the product loop from your plan: mentors publish classes, learners book with tokens, sessions complete,
              reviews raise trust, and UMKM projects create local demand.
            </p>
          </div>
          <div className="feature-grid">
            <article className="feature-card accent-blue">
              <span className="icon-chip">
                <BookOpen size={22} />
              </span>
              <h3>Skill Marketplace</h3>
              <p>Classes, mentoring, workshops, and quick consultations across practical community skills.</p>
            </article>
            <article className="feature-card accent-green">
              <span className="icon-chip">
                <Coins size={22} />
              </span>
              <h3>Token Wallet</h3>
              <p>Teach to earn, learn by spending, and reward reviews without bypassing booking governance.</p>
            </article>
            <article className="feature-card accent-pink">
              <span className="icon-chip">
                <ShieldCheck size={22} />
              </span>
              <h3>Trust Layer</h3>
              <p>Role-based flows, verified mentors, completed-session reviews, and admin moderation.</p>
            </article>
          </div>
        </section>

        <section className="section container" id="marketplace">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Skill Marketplace</p>
              <h2>Practical classes from local mentors.</h2>
            </div>
            <Link className="button-secondary" href="/marketplace">
              Browse all classes
            </Link>
          </div>
          <div className="market-grid">
            {snapshot.skills.map((skill) => (
              <article className="project-card" key={skill.id}>
                <p className="eyebrow">{skill.category}</p>
                <h3>{skill.title}</h3>
                <p>{skill.description}</p>
                <div className="meta-row">
                  <span className="badge orange">{skill.priceToken} token</span>
                  <span className="badge blue">{skill.mode}</span>
                  <span className="badge green">{skill.location}</span>
                </div>
                <div className="row-actions">
                  <Link className="button-primary" href={`/marketplace/${skill.id}`}>
                    Book session
                  </Link>
                  <Link className="button-tertiary" href="/dashboard/mentor">
                    {skill.mentorName}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="section container" id="projects">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Business Skill Hub</p>
              <h2>UMKM projects needing local talent.</h2>
            </div>
            <Link className="button-secondary" href="/projects">
              Explore projects
            </Link>
          </div>
          <div className="project-grid">
            {snapshot.projects.map((project) => (
              <article className="project-card" key={project.id}>
                <span className="icon-chip">
                  <Building2 size={22} />
                </span>
                <h3>{project.title}</h3>
                <p>{project.description}</p>
                <div className="meta-row">
                  <span className="badge pink">{project.requiredSkill}</span>
                  <span className="badge orange">{project.rewardToken} token</span>
                  <span className="badge blue">{project.status}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="section container" id="dashboard">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Demo dashboard</p>
              <h2>Bookings, wallet, and reputation.</h2>
            </div>
          </div>
          <div className="dashboard-grid">
            <div className="product-card">
              <div className="panel-header">
                <h3>Bookings</h3>
                <CalendarCheck size={22} />
              </div>
              <div className="list-stack">
                {snapshot.bookings.map((booking) => (
                  <div className="list-row" key={booking.id}>
                    <div>
                      <strong>{booking.skillTitle}</strong>
                      <p>
                        {booking.scheduleTime} · {booking.status}
                      </p>
                    </div>
                    <span className="badge">{booking.priceToken} token</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="stats-grid">
              <article className="stat-card accent-orange">
                <span>Token balance</span>
                <strong>{snapshot.stats.learnerBalance}</strong>
              </article>
              <article className="stat-card accent-blue">
                <span>Trust score</span>
                <strong>{snapshot.stats.trustScore}</strong>
              </article>
              <article className="stat-card accent-green">
                <span>Mentor rating</span>
                <strong>{snapshot.stats.mentorRating}</strong>
              </article>
            </div>
          </div>
        </section>

        <section className="section container" id="governance">
          <div className="cta-banner">
            <div>
              <p className="eyebrow">Governance rules</p>
              <h2>Designed for trust from the first migration.</h2>
              <p className="lead">
                Skill Loop protects every role with booking rules, token release checks, review locks, applicant privacy, and mentor
                verification.
              </p>
            </div>
            <Link className="button-fin" href="/admin">
              View trust center <BadgeCheck size={16} />
            </Link>
          </div>
          <div className="feature-grid mt-4">
            {snapshot.governanceRules.slice(0, 3).map((rule) => (
              <article className="feature-card accent-blue" key={rule.title}>
                <span className="icon-chip">
                  <Sparkles size={20} />
                </span>
                <h3>{rule.title}</h3>
                <p>{rule.detail}</p>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="footer container">
        <span>Skill Loop · Community skill exchange and local business skill platform</span>
      </footer>
    </>
  );
}
