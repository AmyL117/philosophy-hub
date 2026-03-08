import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Plus, Trash2, Pencil, Check, X, ExternalLink, GripVertical, Users, FolderOpen, Video } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MemberManagement from "@/components/MemberManagement";
import VideoManagement from "@/components/VideoManagement";

const Admin = () => {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editUrl, setEditUrl] = useState("");
  const [editDesc, setEditDesc] = useState("");

  const { data: sections = [] } = useQuery({
    queryKey: ["page_sections"],
    queryFn: async () => {
      const { data } = await supabase.from("page_sections").select("*").order("sort_order");
      return data ?? [];
    },
  });

  const { data: resources = [] } = useQuery({
    queryKey: ["resources", selectedSection],
    queryFn: async () => {
      if (!selectedSection) return [];
      const { data } = await supabase.from("resources").select("*").eq("section_id", selectedSection).order("sort_order");
      return data ?? [];
    },
    enabled: !!selectedSection,
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      if (!selectedSection) return;
      const maxOrder = resources.length > 0 ? Math.max(...resources.map(r => r.sort_order ?? 0)) + 1 : 0;
      await supabase.from("resources").insert({
        section_id: selectedSection,
        title: newTitle,
        url: newUrl || null,
        description: newDesc || null,
        sort_order: maxOrder,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resources"] });
      setAdding(false);
      setNewTitle("");
      setNewUrl("");
      setNewDesc("");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from("resources").update({
        title: editTitle,
        url: editUrl || null,
        description: editDesc || null,
      }).eq("id", id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resources"] });
      setEditingId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from("resources").delete().eq("id", id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resources"] });
    },
  });

  const moveMutation = useMutation({
    mutationFn: async ({ id, direction }: { id: string; direction: "up" | "down" }) => {
      const idx = resources.findIndex(r => r.id === id);
      if (idx < 0) return;
      const swapIdx = direction === "up" ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= resources.length) return;
      const current = resources[idx];
      const swap = resources[swapIdx];
      await supabase.from("resources").update({ sort_order: swap.sort_order }).eq("id", current.id);
      await supabase.from("resources").update({ sort_order: current.sort_order }).eq("id", swap.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resources"] });
    },
  });

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground font-sans">載入中...</div>;
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground font-sans">你沒有管理權限</p>
        <Button variant="outline" onClick={() => navigate("/")} className="font-sans">
          <ArrowLeft className="w-4 h-4 mr-2" />返回首頁
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="font-sans">
            <ArrowLeft className="w-4 h-4 mr-2" />返回
          </Button>
          <h1 className="text-2xl font-serif font-bold text-foreground">管理後台</h1>
        </div>

        <Tabs defaultValue="resources" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="resources" className="flex items-center gap-2 font-sans">
              <FolderOpen className="w-4 h-4" />
              資源管理
            </TabsTrigger>
            <TabsTrigger value="members" className="flex items-center gap-2 font-sans">
              <Users className="w-4 h-4" />
              會員管理
            </TabsTrigger>
          </TabsList>

          <TabsContent value="resources">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-2">
                <h3 className="text-sm font-sans font-semibold text-muted-foreground mb-3">頁面區段</h3>
                {sections.map(s => (
                  <button
                    key={s.id}
                    onClick={() => { setSelectedSection(s.id); setAdding(false); setEditingId(null); }}
                    className={`w-full text-left px-4 py-3 rounded-lg text-sm font-sans transition-colors ${
                      selectedSection === s.id
                        ? "bg-primary/20 text-primary border border-primary/30"
                        : "bg-muted/20 text-muted-foreground hover:bg-muted/40 border border-transparent"
                    }`}
                  >
                    {s.title || s.section_key}
                  </button>
                ))}
              </div>

              <div className="md:col-span-3">
                {!selectedSection ? (
                  <div className="text-center py-20 text-muted-foreground font-sans">
                    ← 選擇一個區段來管理資源
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-serif font-bold text-foreground">
                        {sections.find(s => s.id === selectedSection)?.title} — 延伸資源
                      </h2>
                      <Button size="sm" onClick={() => setAdding(true)} disabled={adding} className="h-8 text-xs font-sans">
                        <Plus className="w-3 h-3 mr-1" />新增資源
                      </Button>
                    </div>

                    {adding && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-lg border border-primary/30 bg-muted/20 space-y-3 mb-4">
                        <Input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="資源標題 *" className="text-sm" />
                        <Input value={newUrl} onChange={e => setNewUrl(e.target.value)} placeholder="網址（選填）" className="text-sm" />
                        <Textarea value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="描述（選填）" className="min-h-[80px] text-sm" />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => addMutation.mutate()} disabled={!newTitle.trim()} className="text-xs"><Plus className="w-3 h-3 mr-1" />新增</Button>
                          <Button size="sm" variant="ghost" onClick={() => { setAdding(false); setNewTitle(""); setNewUrl(""); setNewDesc(""); }} className="text-xs">取消</Button>
                        </div>
                      </motion.div>
                    )}

                    <div className="space-y-2">
                      <AnimatePresence>
                        {resources.map((r, idx) => (
                          <motion.div
                            key={r.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="flex items-start gap-3 p-4 rounded-lg border border-border bg-gradient-card"
                          >
                            <div className="flex flex-col gap-1 pt-1">
                              <button onClick={() => moveMutation.mutate({ id: r.id, direction: "up" })} disabled={idx === 0} className="text-muted-foreground hover:text-foreground disabled:opacity-30 text-xs">▲</button>
                              <GripVertical className="w-3 h-3 text-muted-foreground mx-auto" />
                              <button onClick={() => moveMutation.mutate({ id: r.id, direction: "down" })} disabled={idx === resources.length - 1} className="text-muted-foreground hover:text-foreground disabled:opacity-30 text-xs">▼</button>
                            </div>

                            {editingId === r.id ? (
                              <div className="flex-1 space-y-2">
                                <Input value={editTitle} onChange={e => setEditTitle(e.target.value)} placeholder="標題" className="text-sm" />
                                <Input value={editUrl} onChange={e => setEditUrl(e.target.value)} placeholder="網址" className="text-sm" />
                                <Textarea value={editDesc} onChange={e => setEditDesc(e.target.value)} placeholder="描述" className="min-h-[60px] text-sm" />
                                <div className="flex gap-2">
                                  <Button size="sm" onClick={() => updateMutation.mutate(r.id)} className="text-xs"><Check className="w-3 h-3 mr-1" />儲存</Button>
                                  <Button size="sm" variant="ghost" onClick={() => setEditingId(null)} className="text-xs"><X className="w-3 h-3 mr-1" />取消</Button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-sans font-semibold text-foreground">{r.title}</span>
                                  {r.url && (
                                    <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:opacity-80">
                                      <ExternalLink className="w-3 h-3" />
                                    </a>
                                  )}
                                </div>
                                {r.description && <p className="text-xs text-muted-foreground mt-1">{r.description}</p>}
                              </div>
                            )}

                            {editingId !== r.id && (
                              <div className="flex gap-1">
                                <button onClick={() => { setEditingId(r.id); setEditTitle(r.title); setEditUrl(r.url ?? ""); setEditDesc(r.description ?? ""); }} className="text-muted-foreground hover:text-foreground p-1"><Pencil className="w-3.5 h-3.5" /></button>
                                <button onClick={() => deleteMutation.mutate(r.id)} className="text-muted-foreground hover:text-destructive p-1"><Trash2 className="w-3.5 h-3.5" /></button>
                              </div>
                            )}
                          </motion.div>
                        ))}
                      </AnimatePresence>
                      {resources.length === 0 && !adding && (
                        <div className="text-center py-12 text-muted-foreground font-sans text-sm">
                          尚無資源，點擊「新增資源」開始添加
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="members">
            <MemberManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
