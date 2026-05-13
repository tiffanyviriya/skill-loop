import Link from "next/link";
import { BookOpen, Coins, PenLine, Star, Trophy } from "lucide-react";
import { getMarketplaceSnapshot } from "@skill-loop/domain";
import { PageIntro, PlatformShell } from "../../_components/shell";

export default function LearnerDashboardPage() {
  const snapshot = getMarketplaceSnapshot();
  const completed = snapshot.bookings.filter((booking) => booking.status === "completed").length;

  return (
    <PlatformShell>
      <PageIntro
        eyebrow="Learner dashboard"
        title="Track bookings, token balance, and learning momentum."
        description="This is the learner side of the platform loop: discover skills, spend tokens, complete sessions, and review mentors."
        action={<Link className="button-primary" href="/marketplace">Book another class</Link>}
      />

      <section className="container pb-24">
        <div className="dashboard-grid">
          <div className="product-card">
            <div className="panel-header">
              <h2 className="card-title">Bookings</h2>
              <BookOpen size={22} />
            </div>
            <div className="list-stack">
              {snapshot.bookings.map((booking) => (
                <div className="list-row" key={booking.id}>
                  <div>
                    <strong>{booking.skillTitle}</strong>
                    <p>{booking.scheduleTime} · {booking.mentorName}</p>
                  </div>
                  <span className={booking.status === "completed" ? "badge green" : "badge blue"}>{booking.status}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-4">
            <div className="stats-grid">
              <article className="stat-card accent-orange">
                <Coins size={22} />
                <span>Token balance</span>
                <strong>{snapshot.stats.learnerBalance}</strong>
              </article>
              <article className="stat-card accent-blue">
                <Star size={22} />
                <span>Trust score</span>
                <strong>{snapshot.stats.trustScore}</strong>
              </article>
              <article className="stat-card accent-green">
                <Trophy size={22} />
                <span>Completed</span>
                <strong>{completed}</strong>
              </article>
            </div>
            <div className="product-card">
              <div className="panel-header">
                <h2 className="card-title">Wallet activity</h2>
                <span className="badge orange">Teach to earn</span>
              </div>
              <div className="list-stack">
                {snapshot.walletTransactions.map((transaction) => (
                  <div className="list-row" key={transaction.id}>
                    <div>
                      <strong>{transaction.label}</strong>
                      <p>{transaction.createdAt} · {transaction.type}</p>
                    </div>
                    <span className={transaction.amount > 0 ? "badge green" : "badge orange"}>
                      {transaction.amount > 0 ? "+" : ""}
                      {transaction.amount}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="project-card accent-pink">
              <div className="panel-header">
                <h2 className="card-title">Review completed session</h2>
                <PenLine size={20} />
              </div>
              <form className="grid gap-3" action="/api/reviews" method="post">
                <input type="hidden" name="bookingId" value="booking-3" />
                <label className="grid gap-2 text-sm font-medium">
                  Rating
                  <select className="rounded-lg border border-hairline bg-white px-3 py-3" name="rating" defaultValue="5">
                    <option value="5">5 - Excellent</option>
                    <option value="4">4 - Good</option>
                    <option value="3">3 - Useful</option>
                  </select>
                </label>
                <textarea
                  className="min-h-24 rounded-lg border border-hairline px-3 py-3"
                  name="comment"
                  defaultValue="Practical and easy to apply for my next UMKM project."
                />
                <button className="button-primary" type="submit">Submit review</button>
              </form>
            </div>
          </div>
        </div>
        <div className="mt-4 feature-grid">
          {snapshot.skills.slice(0, 3).map((skill) => (
            <article className="feature-card" key={skill.id}>
              <p className="eyebrow">Recommended next</p>
              <h3>{skill.title}</h3>
              <p>{skill.category} · {skill.priceToken} token · {skill.mentorName}</p>
              <Link className="button-secondary mt-3" href={`/marketplace/${skill.id}`}>View class</Link>
            </article>
          ))}
        </div>
      </section>
    </PlatformShell>
  );
}
