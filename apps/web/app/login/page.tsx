import Link from "next/link";
import { redirect } from "next/navigation";
import { seedUsers } from "@skill-loop/domain";
import { getCurrentUser, roleHomePath } from "../_lib/auth";

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string; registered?: string }>;
}) {
  const user = await getCurrentUser();

  if (user) {
    redirect(roleHomePath(user.role));
  }

  const params = await searchParams;

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div>
          <p className="eyebrow">Welcome back</p>
          <h1 className="page-title">Log in to your Skill Loop workspace.</h1>
          <p className="hero-subhead">Access the right dashboard for learners, mentors, UMKM partners, or admins.</p>
        </div>

        <form className="auth-form" action="/api/auth/login" method="post">
          {params.error === "invalid" ? <p className="auth-error">Invalid email or password. Try one of the demo users below.</p> : null}
          {params.error === "server" ? <p className="auth-error">Login is temporarily unavailable. Please try again after the workspace is synced.</p> : null}
          {params.registered && params.registered !== "seed-demo" ? <p className="auth-success">Account created. You can log in now.</p> : null}
          <label>
            Email
            <input name="email" type="email" placeholder="learner@skillloop.test" required />
          </label>
          <label>
            Password
            <input name="password" type="password" placeholder="skillloop123" required />
          </label>
          <button className="button-primary" type="submit">Log in</button>
          <Link className="button-secondary" href="/register">Create an account</Link>
        </form>
      </section>

      <section className="container pb-24">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Demo accounts</p>
            <h2>Try each role without setup friction.</h2>
          </div>
          <p>Use password <strong>skillloop123</strong> for every demo account.</p>
        </div>
        <div className="feature-grid">
          {seedUsers.map((demoUser) => (
            <article className="feature-card" key={demoUser.id}>
              <p className="eyebrow">{demoUser.role}</p>
              <h3>{demoUser.name}</h3>
              <p>{demoUser.email}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
