import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, BookOpen, Shuffle } from "lucide-react";

const folders = [
  {
    key: "psychology",
    label: "心理學",
    icon: Brain,
    folderId: "15Ns80m2f6dYC8CIL1mAfD92IFBGKNgbZ",
  },
  {
    key: "philosophy",
    label: "哲學",
    icon: BookOpen,
    folderId: "1BnZ2DcjU3VUHGeyVdqkeagrKKqMlnVWG",
  },
  {
    key: "cross",
    label: "交叉",
    icon: Shuffle,
    folderId: "1cfwx3IPtPSGnMOn1tDfbJUhGYnvKN5U4",
  },
];

const ContentTabs = () => {
  const { user, loading } = useAuth();

  if (loading) {
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
      <div className="pt-20 px-4 max-w-6xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold font-serif mb-8">
          <span className="text-gradient-aurora">會員專區</span>
        </h1>

        <Tabs defaultValue="psychology" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            {folders.map((f) => (
              <TabsTrigger key={f.key} value={f.key} className="flex items-center gap-2 font-sans">
                <f.icon className="w-4 h-4" />
                {f.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {folders.map((f) => (
            <TabsContent key={f.key} value={f.key}>
              <div className="rounded-xl border border-border overflow-hidden bg-card">
                <iframe
                  src={`https://drive.google.com/embeddedfolderview?id=${f.folderId}#grid`}
                  className="w-full border-0"
                  style={{ height: "calc(100vh - 240px)", minHeight: "500px" }}
                  title={f.label}
                  allowFullScreen
                />
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

export default ContentTabs;
