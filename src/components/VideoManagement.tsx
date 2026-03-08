import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Pencil, Check, X, Video, Film, GripVertical, ChevronUp, ChevronDown } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

type VideoAccessTier = "free" | "paid" | "premium";

const ACCESS_LABELS: Record<VideoAccessTier, string> = {
  free: "免費",
  paid: "收費",
  premium: "收費",
};

const ACCESS_COLORS: Record<VideoAccessTier, string> = {
  free: "bg-muted text-muted-foreground",
  paid: "bg-primary/20 text-primary",
  premium: "bg-accent/20 text-accent",
};

const CATEGORIES = ["心理學", "哲學", "交叉"];

function extractDriveFileId(link: string): string | null {
  // Match /file/d/ID or id=ID patterns
  const match = link.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || link.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  return match?.[1] ?? null;
}

const VideoManagement = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("all");

  // New video form
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newLink, setNewLink] = useState("");
  const [newCategory, setNewCategory] = useState("心理學");
  const [newTier, setNewTier] = useState<VideoAccessTier>("free");

  // Edit form
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editLink, setEditLink] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editTier, setEditTier] = useState<VideoAccessTier>("free");

  const { data: videos = [], isLoading } = useQuery({
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
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      const fileId = extractDriveFileId(newLink);
      const maxOrder = videos.length > 0 ? Math.max(...videos.map(v => v.sort_order ?? 0)) + 1 : 0;
      const { error } = await supabase.from("videos").insert({
        title: newTitle,
        description: newDesc || null,
        drive_link: newLink,
        drive_file_id: fileId,
        category: newCategory,
        access_tier: newTier,
        sort_order: maxOrder,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["videos"] });
      toast({ title: "已新增", description: "影片已新增" });
      resetNewForm();
    },
    onError: (err: any) => {
      toast({ title: "新增失敗", description: err.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (id: string) => {
      const fileId = extractDriveFileId(editLink);
      const { error } = await supabase.from("videos").update({
        title: editTitle,
        description: editDesc || null,
        drive_link: editLink,
        drive_file_id: fileId,
        category: editCategory,
        access_tier: editTier,
      }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["videos"] });
      toast({ title: "已更新", description: "影片已更新" });
      setEditingId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("videos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["videos"] });
      toast({ title: "已刪除", description: "影片已移除" });
    },
  });

  const moveMutation = useMutation({
    mutationFn: async ({ id, direction }: { id: string; direction: "up" | "down" }) => {
      const idx = filtered.findIndex(v => v.id === id);
      if (idx < 0) return;
      const swapIdx = direction === "up" ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= filtered.length) return;
      const current = filtered[idx];
      const swap = filtered[swapIdx];
      await supabase.from("videos").update({ sort_order: swap.sort_order }).eq("id", current.id);
      await supabase.from("videos").update({ sort_order: current.sort_order }).eq("id", swap.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["videos"] });
    },
  });

  const quickTierMutation = useMutation({
    mutationFn: async ({ id, tier }: { id: string; tier: VideoAccessTier }) => {
      const { error } = await supabase.from("videos").update({ access_tier: tier }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["videos"] });
    },
  });

  const resetNewForm = () => {
    setAdding(false);
    setNewTitle("");
    setNewDesc("");
    setNewLink("");
    setNewCategory("心理學");
    setNewTier("free");
  };

  const filtered = filterCategory === "all" ? videos : videos.filter(v => v.category === filterCategory);

  const categoryCounts = {
    all: videos.length,
    ...CATEGORIES.reduce((acc, c) => ({ ...acc, [c]: videos.filter(v => v.category === c).length }), {} as Record<string, number>),
  };

  if (isLoading) {
    return <div className="py-12 text-center text-muted-foreground font-sans text-sm">載入影片資料...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        {[{ key: "all", label: "全部" }, ...CATEGORIES.map(c => ({ key: c, label: c }))].map(c => (
          <button
            key={c.key}
            onClick={() => setFilterCategory(c.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-sans transition-all ${
              filterCategory === c.key
                ? "bg-primary/20 text-primary border border-primary/30"
                : "bg-muted/20 text-muted-foreground hover:bg-muted/40 border border-transparent"
            }`}
          >
            {c.label} ({categoryCounts[c.key] ?? 0})
          </button>
        ))}
      </div>

      {/* Add button */}
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setAdding(true)} disabled={adding} className="h-8 text-xs font-sans">
          <Plus className="w-3 h-3 mr-1" />新增影片
        </Button>
      </div>

      {/* Add form */}
      {adding && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-lg border border-primary/30 bg-muted/20 space-y-3">
          <Input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="影片標題 *" className="text-sm" />
          <Input value={newLink} onChange={e => setNewLink(e.target.value)} placeholder="Google Drive 影片連結 *" className="text-sm" />
          <Textarea value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="描述（選填）" className="min-h-[60px] text-sm" />
          <div className="grid grid-cols-2 gap-3">
            <Select value={newCategory} onValueChange={setNewCategory}>
              <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(c => <SelectItem key={c} value={c} className="text-sm">{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={newTier} onValueChange={v => setNewTier(v as VideoAccessTier)}>
              <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="free" className="text-sm">免費影片</SelectItem>
                <SelectItem value="paid" className="text-sm">收費影片</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => addMutation.mutate()} disabled={!newTitle.trim() || !newLink.trim()} className="text-xs">
              <Plus className="w-3 h-3 mr-1" />新增
            </Button>
            <Button size="sm" variant="ghost" onClick={resetNewForm} className="text-xs">
              <X className="w-3 h-3 mr-1" />取消
            </Button>
          </div>
        </motion.div>
      )}

      {/* Video grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <AnimatePresence>
          {filtered.map((v, idx) => (
            <motion.div
              key={v.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="rounded-lg border border-border bg-card overflow-hidden group"
            >
              {editingId === v.id ? (
                <div className="p-3 space-y-2">
                  <Input value={editTitle} onChange={e => setEditTitle(e.target.value)} placeholder="標題" className="text-sm" />
                  <Input value={editLink} onChange={e => setEditLink(e.target.value)} placeholder="Google Drive 連結" className="text-sm" />
                  <Textarea value={editDesc} onChange={e => setEditDesc(e.target.value)} placeholder="描述" className="min-h-[60px] text-sm" />
                  <Select value={editCategory} onValueChange={setEditCategory}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(c => <SelectItem key={c} value={c} className="text-sm">{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => updateMutation.mutate(v.id)} className="text-xs flex-1"><Check className="w-3 h-3 mr-1" />儲存</Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingId(null)} className="text-xs"><X className="w-3 h-3" /></Button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-muted/30">
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
                    {/* Sort controls overlay */}
                    <div className="absolute top-1 left-1 flex flex-col gap-0.5">
                      <button
                        onClick={() => moveMutation.mutate({ id: v.id, direction: "up" })}
                        disabled={idx === 0}
                        className="bg-background/90 backdrop-blur-sm rounded p-1 text-foreground hover:bg-primary/20 hover:text-primary disabled:opacity-30 transition-colors shadow-sm"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => moveMutation.mutate({ id: v.id, direction: "down" })}
                        disabled={idx === filtered.length - 1}
                        className="bg-background/90 backdrop-blur-sm rounded p-1 text-foreground hover:bg-primary/20 hover:text-primary disabled:opacity-30 transition-colors shadow-sm"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>
                    {/* Action buttons overlay */}
                    <div className="absolute top-1 right-1 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setEditingId(v.id);
                          setEditTitle(v.title);
                          setEditLink(v.drive_link);
                          setEditDesc(v.description ?? "");
                          setEditCategory(v.category);
                          setEditTier(v.access_tier as VideoAccessTier);
                        }}
                        className="bg-background/80 backdrop-blur-sm rounded p-1 text-foreground hover:bg-background"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => { if (confirm(`確定要刪除「${v.title}」嗎？`)) deleteMutation.mutate(v.id); }}
                        className="bg-background/80 backdrop-blur-sm rounded p-1 text-destructive hover:bg-background"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  {/* Info */}
                  <div className="p-2.5">
                    <p className="text-xs font-sans font-semibold text-foreground truncate mb-1.5">{v.title}</p>
                    <div className="flex items-center gap-1.5 mb-2">
                      <Badge variant="outline" className="text-[10px] font-sans px-1.5 py-0">{v.category}</Badge>
                    </div>
                    <div className="flex gap-1">
                      {(["free", "paid"] as VideoAccessTier[]).map(tier => (
                        <button
                          key={tier}
                          onClick={() => quickTierMutation.mutate({ id: v.id, tier })}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-sans transition-all border ${
                            v.access_tier === tier
                              ? tier === "free"
                                ? "bg-muted text-foreground border-muted-foreground/30"
                                : "bg-primary/20 text-primary border-primary/30"
                              : "bg-transparent text-muted-foreground border-transparent hover:border-border hover:bg-muted/30"
                          }`}
                        >
                          {ACCESS_LABELS[tier]}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {filtered.length === 0 && !adding && (
          <div className="text-center py-12 text-muted-foreground font-sans text-sm">
            {filterCategory === "all" ? "尚無影片，點擊「新增影片」開始添加" : `尚無${filterCategory}影片`}
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoManagement;
