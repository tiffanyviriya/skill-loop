import Link from "next/link";
import { Coins, ShieldCheck } from "lucide-react";
import { requireUser } from "../_lib/auth";
import { PlatformShell } from "../_components/shell";
import { TopupForm } from "./TopupForm";

export default async function TopupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const hasDb = !!process.env.POSTGRES_URL;

  return (
    <PlatformShell>
      <section className="container py-16">
        <div className="mx-auto grid w-[min(960px,100%)] grid-cols-[1fr_420px] gap-8 max-[900px]:grid-cols-1">

          {/* Left — info panel */}
          <div>
            <p className="eyebrow">Token top-up</p>
            <h1 className="page-title">Isi ulang token Skill Loop kamu.</h1>
            <p className="hero-subhead">
              Token digunakan untuk membooking kelas, sesi mentoring, dan workshop dari mentor lokal terpercaya.
            </p>

            <div className="mt-8 grid gap-4">
              <div className="feature-card accent-orange">
                <Coins size={22} className="mb-3 text-fin-orange" />
                <h3>Saldo sekarang</h3>
                <p className="text-2xl font-semibold text-ink">{user.tokenBalance} token</p>
                <p>Gunakan untuk booking kelas di marketplace.</p>
                <Link className="button-secondary mt-4 inline-flex" href="/marketplace">
                  Browse marketplace
                </Link>
              </div>

              <div className="feature-card accent-green">
                <ShieldCheck size={22} className="mb-3 text-report-green" />
                <h3>Pembayaran aman</h3>
                <p>Token masuk instan ke saldo Anda setelah pembayaran dikonfirmasi. Semua transaksi tercatat di wallet history.</p>
              </div>

              <div className="rounded-xl border-[3px] border-hairline bg-canvas p-5 text-sm">
                <p className="font-medium mb-2">Konversi token</p>
                <ul className="grid gap-1.5 text-ink-muted">
                  <li>50 token → Rp 25.000</li>
                  <li>100 token → Rp 50.000</li>
                  <li>200 token → Rp 100.000</li>
                  <li>500 token → Rp 250.000</li>
                </ul>
                <p className="mt-3 text-xs text-ink-subtle">1 token = Rp 500</p>
              </div>
            </div>
          </div>

          {/* Right — form */}
          <div className="product-card">
            <div className="panel-header">
              <h2 className="card-title">Pilih paket & pembayaran</h2>
              <Coins size={20} />
            </div>

            {params.error === "demo-mode" && (
              <p className="auth-error mb-4">Top-up memerlukan koneksi database (demo mode).</p>
            )}
            {params.error === "invalid-amount" && (
              <p className="auth-error mb-4">Jumlah token tidak valid. Pilih dari opsi yang tersedia.</p>
            )}
            {params.error === "invalid-method" && (
              <p className="auth-error mb-4">Metode pembayaran tidak valid.</p>
            )}

            <TopupForm hasDb={hasDb} />
          </div>

        </div>
      </section>
    </PlatformShell>
  );
}
