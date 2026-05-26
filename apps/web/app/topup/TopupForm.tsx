"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { CheckCircle2, Clock, Coins, Copy, CreditCard, QrCode, XCircle } from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────

const AMOUNTS = [
  { tokens: 50,  price: "Rp 25.000"  },
  { tokens: 100, price: "Rp 50.000"  },
  { tokens: 200, price: "Rp 100.000" },
  { tokens: 500, price: "Rp 250.000" },
] as const;

const BANK = {
  name: "BRI",
  number: "075401024978539",
  holder: "IBRAHIM FERIZARIZQI PERMANA",
};

type Amount = typeof AMOUNTS[number]["tokens"];
type Method = "qris" | "bank_transfer";
type Step   = "select" | "pay" | "verify";

// ─── Component ────────────────────────────────────────────────────────────────

export function TopupForm({ hasDb }: { hasDb: boolean }) {
  const [amount,   setAmount]   = useState<Amount>(100);
  const [method,   setMethod]   = useState<Method>("qris");
  const [step,     setStep]     = useState<Step>("select");
  const [copied,   setCopied]   = useState(false);
  // countdown for "Belum" — 0 means ready again, >0 means waiting
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const selected = AMOUNTS.find((a) => a.tokens === amount)!;

  // clean up timer on unmount
  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  function startCountdown() {
    setCountdown(10);
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  function handleCopy() {
    navigator.clipboard.writeText(BANK.number).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  // ── Step 1: select amount + method ──────────────────────────────────────
  if (step === "select") {
    return (
      <div className="grid gap-6">
        {/* Amount */}
        <div className="grid gap-3">
          <p className="text-sm font-medium">Pilih jumlah token</p>
          <div className="grid grid-cols-2 gap-3">
            {AMOUNTS.map((option) => {
              const active = amount === option.tokens;
              return (
                <button
                  key={option.tokens}
                  type="button"
                  onClick={() => setAmount(option.tokens)}
                  className={`rounded-xl border-[3px] p-4 text-left transition-all ${
                    active
                      ? "border-brand-blue bg-blue-50"
                      : "border-hairline bg-surface-1 hover:border-hairline-soft"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Coins size={18} className={active ? "text-brand-blue" : "text-ink-muted"} />
                    <span className={`text-lg font-semibold ${active ? "text-brand-blue" : "text-ink"}`}>
                      {option.tokens} token
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-ink-muted">{option.price}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Method */}
        <div className="grid gap-3">
          <p className="text-sm font-medium">Metode pembayaran</p>
          <div className="grid grid-cols-2 gap-3">
            {(["qris", "bank_transfer"] as Method[]).map((m) => {
              const active = method === m;
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMethod(m)}
                  className={`rounded-xl border-[3px] p-4 text-left transition-all ${
                    active
                      ? "border-brand-blue bg-blue-50"
                      : "border-hairline bg-surface-1 hover:border-hairline-soft"
                  }`}
                >
                  {m === "qris"
                    ? <QrCode size={24} className={active ? "text-brand-blue" : "text-ink-muted"} />
                    : <CreditCard size={24} className={active ? "text-brand-blue" : "text-ink-muted"} />
                  }
                  <p className={`mt-2 font-semibold ${active ? "text-brand-blue" : "text-ink"}`}>
                    {m === "qris" ? "QRIS" : "Bank Transfer"}
                  </p>
                  <p className="text-xs text-ink-muted">
                    {m === "qris" ? "GoPay / semua dompet digital" : "BRI · transfer antar bank"}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Summary */}
        <div className="rounded-xl border-[3px] border-hairline bg-canvas p-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-ink-muted">Token</span>
            <span className="font-semibold">{selected.tokens} token</span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-ink-muted">Metode</span>
            <span className="font-semibold">{method === "qris" ? "QRIS" : "Bank Transfer BRI"}</span>
          </div>
          <div className="mt-3 flex items-center justify-between border-t-2 border-hairline pt-3">
            <span className="font-medium">Total</span>
            <span className="text-lg font-semibold text-fin-orange">{selected.price}</span>
          </div>
        </div>

        {!hasDb && (
          <p className="auth-error">Demo mode — top-up memerlukan koneksi database.</p>
        )}

        <button
          type="button"
          className="button-fin"
          disabled={!hasDb}
          onClick={() => setStep("pay")}
        >
          <Coins size={18} />
          Lanjut ke pembayaran
        </button>
      </div>
    );
  }

  // ── Step 2: show payment details ─────────────────────────────────────────
  if (step === "pay") {
    return (
      <div className="grid gap-5">
        <button
          type="button"
          onClick={() => setStep("select")}
          className="text-sm text-ink-muted hover:text-ink flex items-center gap-1 w-fit"
        >
          ← Kembali pilih paket
        </button>

        {/* Amount reminder */}
        <div className="rounded-xl border-[3px] border-fin-orange bg-canvas px-4 py-3 flex items-center justify-between">
          <span className="text-sm font-medium">Total yang harus dibayar</span>
          <span className="text-lg font-bold text-fin-orange">{selected.price}</span>
        </div>

        {method === "qris" ? (
          /* QRIS */
          <div className="grid gap-4">
            <p className="text-sm font-medium text-center">Scan QR Code berikut dengan GoPay, OVO, Dana, atau aplikasi bank:</p>
            <div className="mx-auto overflow-hidden rounded-2xl border-[3px] border-hairline bg-white p-3 shadow-sm">
              <Image
                src="/qris-skillloop.jpeg"
                alt="QRIS Skill Loop — Ibrahim Ferizarizqi"
                width={320}
                height={400}
                className="block mx-auto rounded-xl"
                priority
              />
            </div>
            <div className="rounded-xl border-[3px] border-hairline bg-canvas p-4 text-sm text-center">
              <p className="font-medium">Ibrahim Ferizarizqi</p>
              <p className="text-ink-muted">GoPay · +62 851 **** 9909</p>
              <p className="mt-2 text-xs text-ink-subtle">Nominal: <strong>{selected.price}</strong> — masukkan nominal secara manual saat scan</p>
            </div>
          </div>
        ) : (
          /* Bank Transfer */
          <div className="grid gap-4">
            <p className="text-sm font-medium">Transfer ke rekening BRI berikut:</p>
            <div className="rounded-xl border-[3px] border-hairline bg-white p-5 grid gap-3">
              {/* Bank logo area */}
              <div className="flex items-center gap-3 pb-3 border-b-2 border-hairline">
                <div className="grid size-10 place-items-center rounded-lg bg-[#00529B] text-white font-bold text-sm">BRI</div>
                <div>
                  <p className="font-semibold">Bank Rakyat Indonesia</p>
                  <p className="text-xs text-ink-muted">Transfer via ATM, Mobile Banking, atau Internet Banking</p>
                </div>
              </div>

              {/* Account number */}
              <div>
                <p className="text-xs text-ink-muted mb-1">Nomor Rekening</p>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xl font-bold tracking-widest">{BANK.number}</span>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className={`badge flex items-center gap-1 transition-all ${copied ? "green" : "blue"}`}
                  >
                    <Copy size={12} />
                    {copied ? "Tersalin!" : "Salin"}
                  </button>
                </div>
              </div>

              {/* Account holder */}
              <div>
                <p className="text-xs text-ink-muted mb-1">Atas Nama</p>
                <p className="font-semibold">{BANK.holder}</p>
              </div>

              {/* Amount */}
              <div className="rounded-lg bg-canvas p-3 border border-hairline">
                <p className="text-xs text-ink-muted mb-1">Nominal Transfer</p>
                <p className="text-lg font-bold text-fin-orange">{selected.price}</p>
                <p className="text-xs text-ink-subtle mt-1">Masukkan nominal yang tepat agar verifikasi lebih mudah.</p>
              </div>
            </div>
          </div>
        )}

        {/* Verify button */}
        <button
          type="button"
          className="button-primary"
          onClick={() => setStep("verify")}
        >
          <CheckCircle2 size={18} />
          Saya sudah transfer — verifikasi pembayaran
        </button>
      </div>
    );
  }

  // ── Step 3: verification — "Apakah sudah bayar?" ─────────────────────────
  return (
    <form action="/api/wallet/topup" method="post" className="grid gap-5">
      <input type="hidden" name="amount" value={amount} />
      <input type="hidden" name="method" value={method} />

      <button
        type="button"
        onClick={() => { setStep("pay"); setCountdown(0); if (timerRef.current) clearInterval(timerRef.current); }}
        className="text-sm text-ink-muted hover:text-ink flex items-center gap-1 w-fit"
      >
        ← Kembali ke detail pembayaran
      </button>

      {/* Big confirmation card */}
      <div className="rounded-xl border-[3px] border-hairline bg-canvas p-6 text-center grid gap-3">
        <div className="mx-auto grid size-14 place-items-center rounded-full bg-surface-1 border-[3px] border-hairline">
          <Coins size={28} className="text-fin-orange" />
        </div>
        <h3 className="text-lg font-semibold">Verifikasi Pembayaran</h3>
        <p className="text-sm text-ink-muted">
          Pastikan kamu sudah {method === "qris" ? "scan QRIS dan menyelesaikan pembayaran" : `mentransfer <strong>${selected.price}</strong> ke rekening BRI di atas`}.
        </p>
        <div className="rounded-lg bg-white border-2 border-hairline px-4 py-3 text-sm font-medium">
          {selected.tokens} token · {selected.price} · {method === "qris" ? "QRIS" : "Bank Transfer BRI"}
        </div>
      </div>

      <p className="text-center text-sm font-semibold">Apakah kamu sudah bayar?</p>

      <div className="grid grid-cols-2 gap-3">
        {/* "Belum" — triggers countdown */}
        <button
          type="button"
          disabled={countdown > 0}
          onClick={startCountdown}
          className={`flex items-center justify-center gap-2 rounded-xl border-[3px] px-4 py-4 font-medium transition-all ${
            countdown > 0
              ? "border-hairline bg-canvas text-ink-muted cursor-not-allowed opacity-70"
              : "border-hairline bg-surface-1 text-ink hover:border-fin-orange hover:text-fin-orange"
          }`}
        >
          {countdown > 0 ? (
            <>
              <Clock size={18} />
              Belum ({countdown}s)
            </>
          ) : (
            <>
              <XCircle size={18} />
              Belum
            </>
          )}
        </button>

        {/* "Sudah" — submits form */}
        <button
          type="submit"
          className="flex items-center justify-center gap-2 rounded-xl border-[3px] border-report-green bg-report-green px-4 py-4 font-medium text-white transition-all hover:-translate-y-0.5"
        >
          <CheckCircle2 size={18} />
          Sudah bayar!
        </button>
      </div>

      <p className="text-center text-xs text-ink-subtle">
        Token akan langsung ditambahkan ke saldo kamu setelah konfirmasi.
      </p>
    </form>
  );
}
