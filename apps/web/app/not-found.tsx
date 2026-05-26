import Link from "next/link";
import { PlatformShell } from "./_components/shell";

export default function NotFound() {
  return (
    <PlatformShell>
      <div className="container flex flex-col items-center justify-center py-32 text-center">
        <p className="eyebrow">404</p>
        <h1 className="page-title mt-2">Page not found.</h1>
        <p className="hero-subhead mt-3">The page you're looking for doesn't exist or has been moved.</p>
        <div className="mt-8 flex gap-3">
          <Link className="button-primary" href="/">Back to home</Link>
          <Link className="button-secondary" href="/marketplace">Browse marketplace</Link>
        </div>
      </div>
    </PlatformShell>
  );
}
