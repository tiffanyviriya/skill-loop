import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser, roleHomePath } from "../_lib/auth";

export default async function RegisterPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
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
          <p className="eyebrow">Join the loop</p>
          <h1 className="page-title">Create an account for your role.</h1>
          <p className="hero-subhead">Start as a learner, mentor, UMKM partner, or admin operator.</p>
        </div>

        <form className="auth-form" action="/api/auth/register" method="post">
          {params.error === "invalid" ? <p className="auth-error">Please complete all fields and use a password with at least 8 characters.</p> : null}
          {params.error === "exists" ? <p className="auth-error">That email is already registered. Try logging in instead.</p> : null}
          {params.error === "server" ? <p className="auth-error">Account creation is temporarily unavailable. Please try again after the workspace is synced.</p> : null}
          <label>
            Name
            <input name="name" placeholder="Your name" required />
          </label>
          <label>
            Email
            <input name="email" type="email" placeholder="you@example.com" required />
          </label>
          <label>
            Password
            <input name="password" type="password" minLength={8} placeholder="At least 8 characters" required />
          </label>
          <label>
            Role
            <select name="role" defaultValue="learner">
              <option value="learner">Learner</option>
              <option value="mentor">Mentor</option>
              <option value="business">UMKM / Business</option>
            </select>
          </label>
          <button className="button-fin" type="submit">Create account</button>
          <Link className="button-secondary" href="/login">I already have an account</Link>
        </form>
      </section>
    </main>
  );
}
