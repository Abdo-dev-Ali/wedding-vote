import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { siteConfig } from "@/config/site";
import SideDashboard, { type DashboardData } from "@/components/SideDashboard";

export default async function SidePage({
  params,
}: {
  params: Promise<{ side: string }>;
}) {
  const { side } = await params;
  if (side !== "bride" && side !== "groom") notFound();
  const validSide = side as "bride" | "groom";

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/");

  // الحماية الحقيقية جوه الدالة: لو الحساب مش صاحب الطرف ده مفيش بيانات
  const { data } = await supabase.rpc("get_side_dashboard", {
    p_wedding: siteConfig.weddingId,
    p_side: validSide,
  });
  if (!data?.ok) notFound();

  return (
    <SideDashboard
      side={validSide}
      weddingId={siteConfig.weddingId}
      data={data as DashboardData}
    />
  );
}