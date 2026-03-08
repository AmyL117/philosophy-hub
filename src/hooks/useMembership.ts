import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import { supabase } from "@/integrations/supabase/client";

export type MembershipTier = "free_member" | "paid_member" | "premium_member";

export const TIER_LABELS: Record<MembershipTier, string> = {
  free_member: "一般會員",
  paid_member: "付費會員",
  premium_member: "尊貴會員",
};

export const TIER_COLORS: Record<MembershipTier, string> = {
  free_member: "bg-muted text-muted-foreground",
  paid_member: "bg-primary/20 text-primary",
  premium_member: "bg-accent/20 text-accent",
};

export function useMembership() {
  const { user } = useAuth();
  const [tier, setTier] = useState<MembershipTier | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setTier(null);
      setLoading(false);
      return;
    }

    const fetchOrCreate = async () => {
      setLoading(true);
      // Try to fetch existing membership
      const { data, error } = await supabase
        .from("user_memberships")
        .select("tier")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data) {
        setTier(data.tier as MembershipTier);
      } else if (!error || error.code === "PGRST116") {
        // No membership found, auto-create as free_member
        const { data: inserted } = await supabase
          .from("user_memberships")
          .insert({
            user_id: user.id,
            email: user.email ?? "",
            display_name: user.user_metadata?.full_name ?? user.email ?? "",
            tier: "free_member",
          })
          .select("tier")
          .single();

        setTier((inserted?.tier as MembershipTier) ?? "free_member");
      }
      setLoading(false);
    };

    fetchOrCreate();
  }, [user]);

  const canViewPaid = tier === "paid_member" || tier === "premium_member";
  const canEdit = tier === "premium_member";

  return { tier, loading, canViewPaid, canEdit };
}
