import { useAuth } from "@/hooks/useAuth";
import { useMembership, TIER_LABELS } from "@/hooks/useMembership";
import { Navigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Brain, BookOpen, Shuffle, Lock, Crown, ExternalLink } from "lucide-react";

const folders = [
  {
    key: "psychology",
    label: "心理學",
    icon: Brain,
    folderId: "15Ns80m2f6dYC8CIL1mAfD92IFBGKNgbZ",
    requiresPaid: false,
  },
  {
    key: "philosophy",
    label: "哲學",
    icon: BookOpen,
    folderId: "1BnZ2DcjU3VUHGeyVdqkeagrKKqMlnVWG",
    requiresPaid: true,
  },
  {
    key: "cross",
    label: "交叉",
    icon: Shuffle,
    folderId: "1cfwx3IPtPSGnMOn1tDfbJUhGYnvKN5U4",
    requiresPaid: true,
  },
];

const ContentTabs = () => {
  const { user, loading: authLoading } = useAuth();
  const { tier, loading: tierLoading, canViewPaid, canEdit } = useMembership();

  if (authLoading || tierLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground font-sans">載入中...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

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

        <Tabs defaultValue="psychology" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            {folders.map((f) => (
              <TabsTrigger
                key={f.key}
                value={f.key}
                disabled={f.requiresPaid && !canViewPaid}
                className="flex items-center gap-2 font-sans"
              >
                {f.requiresPaid && !canViewPaid ? (
                  <Lock className="w-4 h-4" />
                ) : (
                  <f.icon className="w-4 h-4" />
                )}
                {f.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {folders.map((f) => (
            <TabsContent key={f.key} value={f.key}>
              {f.requiresPaid && !canViewPaid ? (
                <div className="rounded-xl border border-border bg-card p-12 text-center">
                  <Lock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-serif font-bold text-foreground mb-2">需要付費會員</h3>
                  <p className="text-sm text-muted-foreground font-sans">
                    此內容僅限付費會員或尊貴會員查看，請聯絡管理員升級會員級別。
                  </p>
                </div>
              ) : (
              <div className="rounded-xl border border-border bg-card p-8 text-center space-y-4">
                  {canEdit && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 text-xs font-sans text-accent mb-2">
                      <Crown className="w-3 h-3" />
                      尊貴會員：你可以檢視、更改及刪除影片
                    </div>
                  )}
                  <f.icon className="w-12 h-12 text-primary mx-auto" />
                  <h3 className="text-xl font-serif font-bold text-foreground">{f.label}影片資料夾</h3>
                  <p className="text-sm text-muted-foreground font-sans">點擊下方連結前往 Google Drive 觀看影片</p>
                  <a
                    href={`https://drive.google.com/drive/folders/${f.folderId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-sans text-sm font-semibold hover:opacity-90 transition-opacity"
                  >
                    <ExternalLink className="w-4 h-4" />
                    開啟影片資料夾
                  </a>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

export default ContentTabs;
