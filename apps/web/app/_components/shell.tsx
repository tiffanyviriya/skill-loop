import Link from "next/link";
import type { ReactNode } from "react";
import { getCurrentUser, roleHomePath } from "../_lib/auth";
import { NavMobile } from "./NavMobile";

const links = [
  { href: "/", label: "Home" },
  { href: "/marketplace", label: "Marketplace" },
  { href: "/projects", label: "UMKM Board" },
  { href: "/dashboard/learner", label: "Learner" },
  { href: "/dashboard/mentor", label: "Mentor" },
  { href: "/admin", label: "Admin" },
];

export async function PlatformShell({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  const homePath = user ? roleHomePath(user.role) : undefined;

  return (
    <>
      <header className="top-nav">
        <Link className="brand" href="/">
          <span className="brand-mark">S</span>
          <span>Skill Loop</span>
        </Link>

        {/* Desktop nav links */}
        <nav className="nav-links" aria-label="Platform navigation">
          {links.map((link) => (
            <Link href={link.href} key={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right side: desktop actions + mobile toggle share the same grid cell */}
        <div className="flex items-center gap-3">
          {/* Desktop auth actions (hidden on mobile via CSS) */}
          <div className="nav-desktop-actions">
            {user ? (
              <>
                <Link className="button-tertiary" href={homePath!}>
                  {user.name}
                </Link>
                <form action="/api/auth/logout" method="post">
                  <button className="button-primary" type="submit">Log out</button>
                </form>
              </>
            ) : (
              <>
                <Link className="button-tertiary" href="/login">Log in</Link>
                <Link className="button-primary" href="/register">Sign up</Link>
              </>
            )}
          </div>

          {/* Mobile hamburger — rendered as client component */}
          <NavMobile
            loggedIn={!!user}
            userName={user?.name}
            userHomePath={homePath}
          />
        </div>
      </header>

      <main>{children}</main>

      <footer className="footer">
        <div className="footer-inner">
          <div>
            <Link className="brand" href="/">
              <span className="brand-mark">S</span>
              <span>Skill Loop</span>
            </Link>
            <p className="mt-2 text-xs text-ink-subtle">
              Ekosistem pertukaran keahlian untuk komunitas UMKM Indonesia.
            </p>
          </div>
          <nav className="footer-links" aria-label="Footer links">
            <Link href="/marketplace">Marketplace</Link>
            <Link href="/projects">UMKM Board</Link>
            <Link href="/dashboard/learner">Learner</Link>
            <Link href="/dashboard/mentor">Mentor</Link>
            <Link href="/login">Log in</Link>
            <Link href="/register">Sign up</Link>
          </nav>
        </div>
      </footer>
    </>
  );
}

export function PageIntro({
  eyebrow,
  title,
  description,
  action,
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
  return (
    <div className="rounded-xl border border-hairline bg-surface-1 p-6 text-ink-muted">
      {children}
    </div>
  );
}
