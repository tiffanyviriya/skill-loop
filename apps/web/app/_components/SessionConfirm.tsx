"use client";

import { useState } from "react";
import { CheckCircle2, Clock, HelpCircle } from "lucide-react";

export function SessionConfirm({ bookingId }: { bookingId: string }) {
  const [state, setState] = useState<"question" | "dismissed">("question");

  if (state === "dismissed") {
    return (
      <p className="text-xs text-ink-muted flex items-center gap-1">
        <Clock size={12} />
        Sesi masih berlangsung
      </p>
    );
  }

  return (
    <div className="mt-2 rounded-lg border-2 border-hairline bg-canvas px-3 py-2.5 text-sm">
      <p className="flex items-center gap-1.5 font-medium mb-2">
        <HelpCircle size={14} className="text-brand-blue" />
        Apakah sesi sudah selesai?
      </p>
      <div className="flex gap-2">
        {/* Iya — submits form to mark complete */}
        <form action={`/api/bookings/${bookingId}`} method="post">
          <input type="hidden" name="action" value="complete" />
          <button
            type="submit"
            className="flex items-center gap-1 rounded-lg border-2 border-report-green bg-report-green px-3 py-1.5 text-xs font-medium text-white transition-all hover:-translate-y-0.5"
          >
            <CheckCircle2 size={13} />
            Iya, sudah selesai
          </button>
        </form>

        {/* Belum — just hides locally */}
        <button
          type="button"
          onClick={() => setState("dismissed")}
          className="rounded-lg border-2 border-hairline bg-surface-1 px-3 py-1.5 text-xs font-medium text-ink-muted transition-all hover:border-hairline-soft"
        >
          Belum
        </button>
      </div>
    </div>
  );
}
