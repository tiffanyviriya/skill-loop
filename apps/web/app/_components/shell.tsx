import Link from "next/link";
import type { ReactNode } from "react";
import { getCurrentUser, roleHomePath } from "../_lib/auth";

const links = [
  { href: "/", label: "Home" },
  { href: "/marketplace", label: "Marketplace" },
  { href: "/projects", label: "UMKM Board" },
  { href: "/dashboard/learner", label: "Learner" },
  { href: "/dashboard/mentor", label: "Mentor" },
  { href: "/admin", label: "Admin" }
];

export async function PlatformShell({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();

  return (
    <>
      <header className="top-nav">
        <Link className="brand" href="/">
          <span className="brand-mark">S</span>
          <span>Skill Loop</span>
        </Link>
        <nav className="nav-links" aria-label="Platform navigation">
          {links.map((link) => (
            <Link href={link.href} key={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="nav-actions">
          {user ? (
            <>
              <Link className="button-tertiary" href={roleHomePath(user.role)}>
                {user.name}
              </Link>
              <form action="/api/auth/logout" method="post">
                <button className="button-primary" type="submit">Log out</button>
              </form>
            </>
          ) : (
            <>
              <Link className="button-tertiary" href="/login">
                Log in
              </Link>
              <Link className="button-primary" href="/register">
                Sign up
              </Link>
            </>
          )}
        </div>
      </header>
      <main>{children}</main>
    </>
  );
}

export function PageIntro({
  eyebrow,
  title,
  description,
  action
}: {
  eyebrow: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <section className="container pt-[72px] pb-8">
      <div className="section-heading">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="page-title">{title}</h1>
          {description ? <p className="hero-subhead">{description}</p> : null}
        </div>
        {action}
      </div>
    </section>
  );
}

export function EmptyNotice({ children }: { children: ReactNode }) {
  return <div className="rounded-xl border border-hairline bg-surface-1 p-6 text-ink-muted">{children}</div>;
}
