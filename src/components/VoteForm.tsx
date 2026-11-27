"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { siteConfig } from "@/config/site";

type Side = "bride" | "groom";

const PHONE_RE = /^01[0125][0-9]{8}$/;

const sideStyles = {
  groom: { dot: "bg-groom", selected: "border-groom bg-groom/15" },
  bride: { dot: "bg-bride", selected: "border-bride bg-bride/15" },
};

// بيحوّل الأرقام الهندية لإنجليزي، ويشيل أي حاجة مش رقم، ويظبط +20
function normalizePhone(value: string) {
  let digits = value
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))
    .replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("201")) {
    digits = "0" + digits.slice(2);
  }
  return digits.slice(0, 11);
}

export default function VoteForm() {
  const router = useRouter();
  const { vote, sides, weddingId } = siteConfig;

  const [side, setSide] = useState<Side | null>(null);
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    setError("");
    if (!side) return setError(vote.errors.chooseSide);
    if (!PHONE_RE.test(phone)) return setError(vote.errors.invalid_phone);

    setLoading(true);
    const supabase = createClient();
    const { data, error: rpcError } = await supabase.rpc("cast_vote", {
      p_wedding: weddingId,
      p_side: side,
      p_phone: phone,
      p_message: message.trim() || null,
    });

    if (rpcError || !data) {
      setError(vote.errors.generic);
      setLoading(false);
      return;
    }

    // نجاح، أو حالة الصفحة نفسها هي اللي تشرحها (صوّت قبل كده، مقفول، ...)
    const refreshReasons = [
      "already_voted",
      "not_authenticated",
      "voting_closed",
      "not_allowed",
    ];
    if (data.ok || refreshReasons.includes(data.reason)) {
      router.refresh();
      return;
    }

    const msg =
      vote.errors[data.reason as keyof typeof vote.errors] ??
      vote.errors.generic;
    setError(msg);
    setLoading(false);
  }

  const consent = side ? vote.consent[side] : vote.consent.none;

  return (
    <div className="flex w-full max-w-[420px] flex-col gap-5 text-right">
      <h2 className="text-center font-[family-name:var(--font-amiri)] text-3xl text-ink">
        {vote.heading}
      </h2>

      <div className="grid grid-cols-2 gap-3">
        {(["groom", "bride"] as Side[]).map((key) => {
          const selected = side === key;
          return (
            <button
              key={key}
              type="button"
              aria-pressed={selected}
              onClick={() => setSide(key)}
              className={`flex min-h-24 flex-col items-center justify-center gap-2 rounded-2xl border-2 px-3 py-4 transition active:scale-[0.98] cursor-pointer ${
                selected ? sideStyles[key].selected : "border-gold bg-white"
              }`}
            >
              <span className={`h-3 w-3 rounded-full ${sideStyles[key].dot}`} />
              <span className="font-[family-name:var(--font-amiri)] text-2xl text-ink">
                {sides[key].name} {sides[key].label}
              </span>
              {selected && <span className="text-sm text-ink">✓</span>}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="phone" className="text-base font-medium text-ink">
          {vote.phoneLabel}
        </label>
        <input
          id="phone"
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          dir="ltr"
          placeholder="01XXXXXXXXX"
          value={phone}
          onChange={(e) => setPhone(normalizePhone(e.target.value))}
          className="min-h-14 rounded-xl border border-gold bg-white px-4 text-lg text-ink outline-none focus:border-2"
        />
        <p className="text-sm text-ink-soft">{vote.phoneHint}</p>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="message" className="text-base font-medium text-ink">
          {vote.messageLabel}
        </label>
        <textarea
          id="message"
          rows={3}
          maxLength={vote.messageMax}
          placeholder={vote.messagePlaceholder}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="rounded-xl border border-gold bg-white px-4 py-3 text-lg text-ink outline-none focus:border-2"
        />
        <p className="text-sm text-ink-soft" dir="ltr">
          {message.length}/{vote.messageMax}
        </p>
      </div>

      <p className="text-base leading-relaxed text-ink">{consent}</p>

      {error && (
        <p role="alert" className="text-base font-medium text-ink">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={submit}
        disabled={loading}
        className="min-h-14 w-full rounded-xl bg-ink-soft text-lg font-medium text-white transition active:scale-[0.98] disabled:opacity-60 cursor-pointer"
      >
        {loading ? vote.submitting : vote.submit}
      </button>
    </div>
  );
}
