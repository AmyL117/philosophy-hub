import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Trash2, Users, Crown, Star, User, Plus, X } from "lucide-react";
import { TIER_LABELS, TIER_COLORS, type MembershipTier } from "@/hooks/useMembership";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

const TIER_ICONS: Record<MembershipTier, typeof User> = {
  free_member: User,
  paid_member: Star,
  premium_member: Crown,
};

const MemberManagement = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [filter, setFilter] = useState<string>("all");
  const [adding, setAdding] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newDisplayName, setNewDisplayName] = useState("");
  const [newTier, setNewTier] = useState<MembershipTier>("free_member");

  const { data: members = [], isLoading } = useQuery({
    queryKey: ["user_memberships"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_memberships")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const updateTierMutation = useMutation({
    mutationFn: async ({ id, tier }: { id: string; tier: string }) => {
      const { error } = await supabase
        .from("user_memberships")
        .update({ tier: tier as MembershipTier })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user_memberships"] });
      toast({ title: "已更新", description: "會員級別已更新" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("user_memberships").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user_memberships"] });
      toast({ title: "已刪除", description: "會員已移除" });
    },
  });

  const addMemberMutation = useMutation({
    mutationFn: async () => {
      // Generate a placeholder user_id for manually added members
      const { error } = await supabase.from("user_memberships").insert({
        email: newEmail,
        display_name: newDisplayName || null,
        tier: newTier,
        user_id: crypto.randomUUID(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user_memberships"] });
      toast({ title: "已新增", description: `已新增會員 ${newEmail}` });
      setAdding(false);
      setNewEmail("");
      setNewDisplayName("");
      setNewTier("free_member");
    },
    onError: (err: any) => {
      toast({ title: "新增失敗", description: err.message, variant: "destructive" });
    },
  });

  const filtered = filter === "all" ? members : members.filter((m) => m.tier === filter);

  const tierCounts = {
    all: members.length,
    free_member: members.filter((m) => m.tier === "free_member").length,
    paid_member: members.filter((m) => m.tier === "paid_member").length,
    premium_member: members.filter((m) => m.tier === "premium_member").length,
  };

  if (isLoading) {
    return <div className="py-12 text-center text-muted-foreground font-sans text-sm">載入會員資料...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { key: "all", label: "全部會員", icon: Users, count: tierCounts.all },
          { key: "free_member", label: TIER_LABELS.free_member, icon: User, count: tierCounts.free_member },
          { key: "paid_member", label: TIER_LABELS.paid_member, icon: Star, count: tierCounts.paid_member },
          { key: "premium_member", label: TIER_LABELS.premium_member, icon: Crown, count: tierCounts.premium_member },
        ].map((s) => (
          <button
            key={s.key}
            onClick={() => setFilter(s.key)}
            className={`p-4 rounded-lg border text-left transition-all ${
              filter === s.key
                ? "border-primary/40 bg-primary/10"
                : "border-border bg-card hover:border-primary/20"
            }`}
          >
            <s.icon className="w-5 h-5 text-primary mb-2" />
            <div className="text-2xl font-bold font-serif text-foreground">{s.count}</div>
            <div className="text-xs font-sans text-muted-foreground">{s.label}</div>
          </button>
        ))}
      </div>

      {/* Add member */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-sans font-semibold text-muted-foreground">會員列表</h3>
        <Button size="sm" onClick={() => setAdding(true)} disabled={adding} className="h-8 text-xs font-sans">
          <Plus className="w-3 h-3 mr-1" />新增會員
        </Button>
      </div>

      {adding && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-lg border border-primary/30 bg-muted/20 space-y-3">
          <Input value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="電子郵件 *" className="text-sm" />
          <Input value={newDisplayName} onChange={e => setNewDisplayName(e.target.value)} placeholder="顯示名稱（選填）" className="text-sm" />
          <Select value={newTier} onValueChange={(v) => setNewTier(v as MembershipTier)}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="free_member" className="text-sm">一般會員</SelectItem>
              <SelectItem value="paid_member" className="text-sm">付費會員</SelectItem>
              <SelectItem value="premium_member" className="text-sm">尊貴會員</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => addMemberMutation.mutate()} disabled={!newEmail.trim()} className="text-xs">
              <Plus className="w-3 h-3 mr-1" />新增
            </Button>
            <Button size="sm" variant="ghost" onClick={() => { setAdding(false); setNewEmail(""); setNewDisplayName(""); setNewTier("free_member"); }} className="text-xs">
              <X className="w-3 h-3 mr-1" />取消
            </Button>
          </div>
        </motion.div>
      )}

      {/* Member list */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {filtered.map((m) => {
            const TierIcon = TIER_ICONS[(m.tier as MembershipTier) ?? "free_member"];
            return (
              <motion.div
                key={m.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-4 p-4 rounded-lg border border-border bg-card"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <TierIcon className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-sm font-sans font-semibold text-foreground truncate">
                      {m.display_name || m.email}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground font-sans truncate">{m.email}</div>
                </div>

                <Badge className={`${TIER_COLORS[(m.tier as MembershipTier) ?? "free_member"]} text-xs font-sans shrink-0`}>
                  {TIER_LABELS[(m.tier as MembershipTier) ?? "free_member"]}
                </Badge>

                <Select
                  value={m.tier ?? "free_member"}
                  onValueChange={(v) => updateTierMutation.mutate({ id: m.id, tier: v })}
                >
                  <SelectTrigger className="w-[120px] h-8 text-xs font-sans">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free_member" className="text-xs">一般會員</SelectItem>
                    <SelectItem value="paid_member" className="text-xs">付費會員</SelectItem>
                    <SelectItem value="premium_member" className="text-xs">尊貴會員</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    if (confirm(`確定要移除 ${m.email} 嗎？`)) {
                      deleteMutation.mutate(m.id);
                    }
                  }}
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground font-sans text-sm">
            {filter === "all" ? "尚無會員" : `尚無${TIER_LABELS[filter as MembershipTier]}會員`}
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberManagement;
