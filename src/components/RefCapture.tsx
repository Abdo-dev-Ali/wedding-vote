"use client";

import { useEffect } from "react";
import { REF_KEY, isValidRef } from "@/lib/referral";

export default function RefCapture() {
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get("ref");
      if (ref === null) return;

      if (isValidRef(ref)) localStorage.setItem(REF_KEY, ref);

      // نشيل الكود من الرابط عشان لو الضيف نسخه ما ينقلش كود غيره
      params.delete("ref");
      const qs = params.toString();
      window.history.replaceState(
        null,
        "",
        window.location.pathname + (qs ? `?${qs}` : ""),
      );
    } catch {
      // التخزين مش متاح: مش مشكلة
    }
  }, []);

  return null;
}
