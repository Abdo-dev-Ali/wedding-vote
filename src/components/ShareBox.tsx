"use client";

import { useState } from "react";
import QRCode from "qrcode";
import { createClient } from "@/lib/supabase/client";
import { siteConfig } from "@/config/site";

export default function ShareBox({ weddingId }: { weddingId: string }) {
  const { share } = siteConfig;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [link, setLink] = useState<string | null>(null);
  const [qr, setQr] = useState<string | null>(null);
  const [showQr, setShowQr] = useState(false);

  // الضغط هو الموافقة: بيسجّل المشاركة في القاعدة ويرجّع الرابط الشخصي
  async function prepareLink() {
    if (link) return link;
    const supabase = createClient();
    const { data, error: rpcError } = await supabase.rpc("mark_shared", {
      p_wedding: weddingId,
    });
    if (rpcError || !data?.ok) throw new Error("mark_shared failed");
    const url = `${siteConfig.url}/?ref=${data.guest_code}`;
    setLink(url);
    return url;
  }

  async function onShare() {
    setError("");
    setNotice("");
    setBusy(true);
    try {
      const url = await prepareLink();
      if (typeof navigator.share === "function") {
        try {
          await navigator.share({ title: siteConfig.title, text: share.text, url });
        } catch (e) {
          // الضيف قفل نافذة المشاركة: مش خطأ
          if ((e as Error).name !== "AbortError") throw e;
        }
      } else {
        await navigator.clipboard.writeText(`${share.text}\n${url}`);
        setNotice(share.copied);
      }
    } catch {
      setError(share.error);
    } finally {
      setBusy(false);
    }
  }

  async function onQr() {
    if (showQr) {
      setShowQr(false);
      return;
    }
    setError("");
    setNotice("");
    setBusy(true);
    try {
      const url = await prepareLink();
      if (!qr) {
        // الـ QR بيتولّد في المتصفح، والرابط مش بيتبعت لأي موقع
        const dataUrl = await QRCode.toDataURL(url, {
          width: 280,
          margin: 2,
          color: { dark: "#1c2a4a", light: "#ffffff" },
        });
        setQr(dataUrl);
      }
      setShowQr(true);
    } catch {
      setError(share.error);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-gold bg-white px-4 py-4 text-right">
      <p className="text-base leading-relaxed text-ink">{share.consent}</p>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onShare}
          disabled={busy}
          className="min-h-12 flex-1 rounded-xl bg-ink-soft px-4 text-lg text-white transition active:scale-[0.98] disabled:opacity-60"
        >
          {share.button}
        </button>
        <button
          type="button"
          onClick={onQr}
          disabled={busy}
          className="min-h-12 rounded-xl border border-ink-soft px-4 text-lg text-ink transition active:scale-[0.98] disabled:opacity-60"
        >
          {showQr ? share.qrHide : share.qrShow}
        </button>
      </div>

      {notice && (
        <p role="status" className="text-base text-ink">
          {notice}
        </p>
      )}
      {error && (
        <p role="alert" className="text-base font-medium text-ink">
          {error}
        </p>
      )}

      {showQr && qr && (
        <div className="flex flex-col items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qr} alt="QR" width={280} height={280} className="rounded-lg border border-gold" />
          <p className="text-sm text-ink-soft">{share.qrHint}</p>
        </div>
      )}

      {link && (
        <p dir="ltr" className="select-all break-all text-sm text-ink-soft">
          {link}
        </p>
      )}
    </section>
  );
}