import Link from "next/link";
import { BadgeCheck, CalendarCheck, Coins, TrendingUp } from "lucide-react";
import { seedBookings, seedLeaderboard, seedSkills } from "@skill-loop/domain";
import { PageIntro, PlatformShell } from "../../_components/shell";

export default function MentorDashboardPage() {
  const mentorSkills = seedSkills.filter((skill) => skill.mentorName === "Nadia Putri" || skill.mentorBadge === "verified");
  const upcomingBookings = seedBookings.filter((booking) => booking.status !== "completed");

  return (
    <PlatformShell>
      <PageIntro
        eyebrow="Mentor dashboard"
        title="Manage classes, complete sessions, and earn tokens."
        description="Mentors create classes, receive bookings, complete sessions, and grow their trust score."
        action={<Link className="button-fin" href="/marketplace">Publish class</Link>}
      />

      <section className="container grid grid-cols-[1fr_380px] gap-4 pb-24 max-[900px]:grid-cols-1">
        <div className="product-card">
          <div className="panel-header">
            <h2 className="card-title">Your classes</h2>
            <BadgeCheck size={22} />
          </div>
          <div className="market-grid">
            {mentorSkills.map((skill) => (
              <article className="project-card" key={skill.id}>
                <p className="eyebrow">{skill.category}</p>
                <h3>{skill.title}</h3>
                <p>{skill.sessionsCompleted} sessions · {skill.mentorRating} rating</p>
                <div className="meta-row">
                  <span className="badge orange">{skill.priceToken} token</span>
                  <span className="badge green">{skill.mentorBadge}</span>
                </div>
              </article>
            ))}
          </div>
        </div>

        <aside className="grid gap-4">
          <article className="stat-card accent-green">
            <TrendingUp size={22} />
            <span>Ranking signal</span>
            <strong>#4</strong>
          </article>
          <article className="stat-card accent-orange">
            <Coins size={22} />
            <span>Pending token release</span>
            <strong>42</strong>
          </article>
          <article className="project-card accent-blue">
            <div className="panel-header">
              <h2 className="card-title">Upcoming</h2>
              <CalendarCheck size={20} />
            </div>
            <div className="list-stack">
              {upcomingBookings.map((booking) => (
                <div className="list-row" key={booking.id}>
                  <div>
                    <strong>{booking.skillTitle}</strong>
                    <p>{booking.learnerName} · {booking.scheduleTime}</p>
                  </div>
                  <span className="badge blue">{booking.status}</span>
                </div>
              ))}
            </div>
          </article>
          <article className="project-card accent-pink">
            <p className="eyebrow">Create class draft</p>
            <h2 className="card-title">New skill offer</h2>
            <form className="grid gap-3">
              <input className="rounded-lg border border-hairline px-3 py-3" placeholder="Class title" />
              <input className="rounded-lg border border-hairline px-3 py-3" placeholder="Category" />
              <input className="rounded-lg border border-hairline px-3 py-3" placeholder="Token price" />
              <button className="button-fin" type="button">Save draft</button>
            </form>
          </article>
        </aside>
      </section>
      <section className="container pb-24">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Ecosystem incentives</p>
            <h2>Leaderboard drives mentor activity without making trust noisy.</h2>
          </div>
        </div>
        <div className="feature-grid">
          {seedLeaderboard.map((mentor) => (
            <article className="feature-card" key={mentor.name}>
              <p className="eyebrow">Rank #{mentor.rank}</p>
              <h3>{mentor.name}</h3>
              <p>{mentor.specialty} · {mentor.sessions} sessions · {mentor.rating} rating</p>
              <span className={mentor.badge === "verified" ? "badge green" : "badge blue"}>{mentor.badge}</span>
            </article>
          ))}
        </div>
      </section>
    </PlatformShell>
  );
}
