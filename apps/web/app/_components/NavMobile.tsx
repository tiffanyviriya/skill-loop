"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Menu, X } from "lucide-react";

const links = [
  { href: "/", label: "Home" },
  { href: "/marketplace", label: "Marketplace" },
  { href: "/projects", label: "UMKM Board" },
  { href: "/dashboard/learner", label: "Learner dashboard" },
  { href: "/dashboard/mentor", label: "Mentor dashboard" },
  { href: "/topup", label: "Top up token" },
  { href: "/admin", label: "Admin" },
];

type Props = {
  loggedIn: boolean;
  userName?: string;
  userHomePath?: string;
};

export function NavMobile({ loggedIn, userName, userHomePath }: Props) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Only portal after hydration
  useEffect(() => { setMounted(true); }, []);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const portal = mounted ? createPortal(
    <>
      {/* Overlay */}
      <div
        className={`nav-overlay${open ? " open" : ""}`}
        aria-hidden="true"
        onClick={() => setOpen(false)}
      />

      {/* Drawer */}
      <nav
        className={`nav-drawer${open ? " open" : ""}`}
        aria-label="Mobile navigation"
      >
        <div className="nav-drawer-header">
          <Link className="brand" href="/" onClick={() => setOpen(false)}>
            <span className="brand-mark">S</span>
            <span>Skill Loop</span>
          </Link>
          <button
            className="nav-mobile-toggle"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            style={{ display: "flex" }}
          >
            <X size={18} />
          </button>
        </div>

        <div className="nav-drawer-links">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="nav-drawer-link"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="nav-drawer-footer">
          {loggedIn ? (
            <>
              {userHomePath && userName && (
                <Link
                  className="button-tertiary w-full"
                  href={userHomePath}
                  onClick={() => setOpen(false)}
                >
                  {userName}
                </Link>
              )}
              <form action="/api/auth/logout" method="post">
                <button className="button-primary w-full" type="submit">
                  Log out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                className="button-tertiary w-full"
                href="/login"
                onClick={() => setOpen(false)}
              >
                Log in
              </Link>
              <Link
                className="button-primary w-full"
                href="/register"
                onClick={() => setOpen(false)}
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </nav>
    </>,
    document.body
  ) : null;

  return (
    <>
      {/* Hamburger toggle — visible on mobile only (CSS hides on desktop) */}
      <button
        className="nav-mobile-toggle"
        aria-label="Open menu"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <Menu size={18} />
      </button>

      {portal}
    </>
  );
}
