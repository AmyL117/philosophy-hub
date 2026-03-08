import { useAuth } from "@/hooks/useAuth";
import { useMembership, TIER_LABELS } from "@/hooks/useMembership";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Brain, BookOpen, Shuffle, Lock, Crown, Play } from "lucide-react";
import { useState } from "react";

type VideoAccessTier = "free" | "paid" | "premium";

const categories = [
  { key: "心理學", label: "心理學", icon: Brain, requiresPaid: false },
  { key: "哲學", label: "哲學", icon: BookOpen, requiresPaid: true },
  { key: "交叉", label: "交叉", icon: Shuffle, requiresPaid: true },
];

function getEmbedUrl(driveLink: string, fileId: string | null): string | null {
  const id = fileId || driveLink.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)?.[1] || driveLink.match(/[?&]id=([a-zA-Z0-9_-]+)/)?.[1];
  if (!id) return null;
  return `https://drive.google.com/file/d/${id}/preview`;
}

const ContentTabs = () => {
  const { user, loading: authLoading } = useAuth();
  const { tier, loading: tierLoading, canViewPaid } = useMembership();
  const [playingId, setPlayingId] = useState<string | null>(null);

  const { data: videos = [] } = useQuery({
    queryKey: ["videos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("videos")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data ?? [];
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

  const canAccess = (videoTier: string) => {
    if (videoTier === "free") return true;
    if (videoTier === "paid") return tier === "paid_member" || tier === "premium_member";
    if (videoTier === "premium") return tier === "premium_member";
    return false;
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
            const categoryVideos = videos.filter(v => v.category === c.key);

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
                ) : categoryVideos.length === 0 ? (
                  <div className="rounded-xl border border-border bg-card p-12 text-center">
                    <c.icon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-serif font-bold text-foreground mb-2">即將推出</h3>
                    <p className="text-sm text-muted-foreground font-sans">此分類的影片即將上線，敬請期待。</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {categoryVideos.map(v => {
                      const accessible = canAccess(v.access_tier);
                      const embedUrl = getEmbedUrl(v.drive_link, v.drive_file_id);
                      const isPlaying = playingId === v.id;

                      return (
                        <div
                          key={v.id}
                          className="rounded-xl border border-border bg-card overflow-hidden"
                        >
                          {/* Video player area */}
                          <div className="relative aspect-video bg-muted/30">
                            {!accessible ? (
                              <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <Lock className="w-8 h-8 text-muted-foreground mb-2" />
                                <span className="text-xs text-muted-foreground font-sans">需要更高級別會員</span>
                              </div>
                            ) : isPlaying && embedUrl ? (
                              <iframe
                                src={embedUrl}
                                className="w-full h-full"
                                allow="autoplay; encrypted-media"
                                allowFullScreen
                                sandbox="allow-scripts allow-same-origin allow-popups"
                              />
                            ) : (
                              <button
                                onClick={() => setPlayingId(v.id)}
                                className="absolute inset-0 flex flex-col items-center justify-center hover:bg-muted/20 transition-colors group"
                              >
                                <div className="w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                                  <Play className="w-6 h-6 text-primary-foreground ml-0.5" />
                                </div>
                              </button>
                            )}
                          </div>

                          {/* Info */}
                          <div className="p-4">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-sans font-semibold text-foreground truncate">{v.title}</span>
                              {v.access_tier !== "free" && (
                                <Badge variant="outline" className="text-[10px] font-sans shrink-0">
                                  {v.access_tier === "paid" ? "付費" : "尊貴"}
                                </Badge>
                              )}
                            </div>
                            {v.description && (
                              <p className="text-xs text-muted-foreground font-sans line-clamp-2">{v.description}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
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
