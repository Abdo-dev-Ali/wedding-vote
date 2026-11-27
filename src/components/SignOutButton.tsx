"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { siteConfig } from "@/config/site";

export default function SignOutButton() {
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={signOut}
      className="min-h-11 rounded-lg bg-ink-soft px-5 text-base text-white transition active:scale-[0.98] cursor-pointer"
    >
      {siteConfig.home.logout}
    </button>
  );
}