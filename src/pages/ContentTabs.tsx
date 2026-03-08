import { useAuth } from "@/hooks/useAuth";
import { useMembership, TIER_LABELS } from "@/hooks/useMembership";
import { Navigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Brain, BookOpen, Shuffle, Lock, Crown, ChevronUp, ChevronDown, Film } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

type VideoAccessTier = "free" | "paid" | "premium";

const ACCESS_LABELS: Record<VideoAccessTier, string> = {
  free: "免費",
  paid: "收費",
  premium: "收費",
};

const categories = [
  { key: "心理學", label: "心理學", icon: Brain, requiresPaid: false, folderId: "15Ns80m2f6dYC8CIL1mAfD92IFBGKNgbZ" },
  { key: "哲學", label: "哲學", icon: BookOpen, requiresPaid: true, folderId: "1BnZ2DcjU3VUHGeyVdqkeagrKKqMlnVWG" },
  { key: "交叉", label: "交叉", icon: Shuffle, requiresPaid: true, folderId: "1cfwx3IPtPSGnMOn1tDfbJUhGYnvKN5U4" },
];

const ContentTabs = () => {
  const { user, loading: authLoading, isAdmin } = useAuth();
  const { tier, loading: tierLoading, canViewPaid } = useMembership();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: videos = [], isLoading: videosLoading } = useQuery({
    queryKey: ["videos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("videos")
        .select("*")
        .order("category")
        .order("sort_order");
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user,
  });

  const moveMutation = useMutation({
    mutationFn: async ({ id, direction, category }: { id: string; direction: "up" | "down"; category: string }) => {
      const categoryVideos = videos.filter(v => v.category === category);
      const idx = categoryVideos.findIndex(v => v.id === id);
      if (idx < 0) return;
      const swapIdx = direction === "up" ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= categoryVideos.length) return;
      const current = categoryVideos[idx];
      const swap = categoryVideos[swapIdx];
      await supabase.from("videos").update({ sort_order: swap.sort_order }).eq("id", current.id);
      await supabase.from("videos").update({ sort_order: current.sort_order }).eq("id", swap.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["videos"] });
    },
  });

  const quickTierMutation = useMutation({
    mutationFn: async ({ id, tierValue }: { id: string; tierValue: VideoAccessTier }) => {
      const { error } = await supabase.from("videos").update({ access_tier: tierValue }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["videos"] });
      toast({ title: "已更新", description: "影片狀態已更新" });
    },
  });

  if (authLoading || tierLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground font-sans">載入中...</div>
      </div>
    );
  }

  if (!user) return <Navigate to="/" replace />;

  const getVideosForCategory = (categoryKey: string) => {
    return videos.filter(v => v.category === categoryKey);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 px-4 max-w-6xl mx-auto pb-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl md:text-4xl font-bold font-serif">
            <span className="text-gradient-aurora">會員專區</span>
          </h1>
          {tier && (
            <Badge variant="outline" className="flex items-center gap-1.5 font-sans text-xs px-3 py-1">
              <Crown className="w-3 h-3" />
              {TIER_LABELS[tier]}
            </Badge>
          )}
        </div>

        <Tabs defaultValue="心理學" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            {categories.map((c) => (
              <TabsTrigger
                key={c.key}
                value={c.key}
                disabled={c.requiresPaid && !canViewPaid}
                className="flex items-center gap-2 font-sans"
              >
                {c.requiresPaid && !canViewPaid ? <Lock className="w-4 h-4" /> : <c.icon className="w-4 h-4" />}
                {c.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map((c) => {
            const categoryVideos = getVideosForCategory(c.key);

            return (
              <TabsContent key={c.key} value={c.key}>
                {c.requiresPaid && !canViewPaid ? (
                  <div className="rounded-xl border border-border bg-card p-12 text-center">
                    <Lock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-serif font-bold text-foreground mb-2">需要付費會員</h3>
                    <p className="text-sm text-muted-foreground font-sans">
                      此內容僅限付費會員或尊貴會員查看，請聯絡管理員升級會員級別。
                    </p>
                  </div>
                ) : videosLoading ? (
                  <div className="text-center py-12 text-muted-foreground font-sans text-sm">載入影片中...</div>
                ) : categoryVideos.length === 0 ? (
                  <div className="rounded-xl border border-border bg-card p-12 text-center">
                    <Film className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground font-sans">此類別尚無影片</p>
                  </div>
                ) : (
                  <div className="rounded-xl border border-border bg-card p-6">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      <AnimatePresence>
                        {categoryVideos.map((v, idx) => (
                          <motion.div
                            key={v.id}
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="group relative"
                          >
                            {/* Thumbnail */}
                            <a
                              href={v.drive_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block relative aspect-video rounded-lg overflow-hidden bg-muted/30 hover:shadow-md transition-shadow"
                            >
                              {v.drive_file_id ? (
                                <img
                                  src={`https://drive.google.com/thumbnail?id=${v.drive_file_id}&sz=w400`}
                                  alt={v.title}
                                  className="w-full h-full object-cover"
                                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Film className="w-8 h-8 text-muted-foreground/40" />
                                </div>
                              )}

                              {/* Access tier badge for non-admin users */}
                              {!isAdmin && v.access_tier !== "free" && (
                                <div className="absolute top-1 right-1">
                                  <span className="bg-primary/80 text-primary-foreground text-[10px] px-1.5 py-0.5 rounded font-sans">
                                    {ACCESS_LABELS[v.access_tier as VideoAccessTier]}
                                  </span>
                                </div>
                              )}
                            </a>

                            {/* Title */}
                            <p className="text-xs font-sans text-foreground mt-1.5 truncate">{v.title}</p>

                            {/* Admin controls */}
                            {isAdmin && (
                              <div className="mt-1.5 space-y-1">
                                {/* Sort buttons */}
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => moveMutation.mutate({ id: v.id, direction: "up", category: c.key })}
                                    disabled={idx === 0}
                                    className="bg-muted/50 hover:bg-primary/20 hover:text-primary rounded p-0.5 text-muted-foreground disabled:opacity-30 transition-colors"
                                  >
                                    <ChevronUp className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => moveMutation.mutate({ id: v.id, direction: "down", category: c.key })}
                                    disabled={idx === categoryVideos.length - 1}
                                    className="bg-muted/50 hover:bg-primary/20 hover:text-primary rounded p-0.5 text-muted-foreground disabled:opacity-30 transition-colors"
                                  >
                                    <ChevronDown className="w-3.5 h-3.5" />
                                  </button>
                                  <span className="text-[10px] text-muted-foreground font-sans ml-1">排序</span>
                                </div>

                                {/* Tier toggle */}
                                <div className="flex gap-1">
                                  {(["free", "paid"] as VideoAccessTier[]).map(t => (
                                    <button
                                      key={t}
                                      onClick={() => quickTierMutation.mutate({ id: v.id, tierValue: t })}
                                      className={`px-2 py-0.5 rounded-full text-[10px] font-sans transition-all border ${
                                        v.access_tier === t
                                          ? t === "free"
                                            ? "bg-muted text-foreground border-muted-foreground/30"
                                            : "bg-primary/20 text-primary border-primary/30"
                                          : "bg-transparent text-muted-foreground border-transparent hover:border-border hover:bg-muted/30"
                                      }`}
                                    >
                                      {ACCESS_LABELS[t]}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>
                )}
              </TabsContent>
            );
          })}
        </Tabs>
      </div>
    </div>
  );
};

export default ContentTabs;
