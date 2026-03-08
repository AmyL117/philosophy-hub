import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEditMode } from "@/contexts/EditModeContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, GripVertical, ExternalLink, Pencil, Check, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ResourceEditorProps {
  sectionKey: string;
}

const ResourceEditor = ({ sectionKey }: ResourceEditorProps) => {
  const { editMode } = useEditMode();
  const queryClient = useQueryClient();
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editUrl, setEditUrl] = useState("");
  const [editDesc, setEditDesc] = useState("");

  // Get section id
  const { data: section } = useQuery({
    queryKey: ["page_sections", sectionKey],
    queryFn: async () => {
      const { data } = await supabase
        .from("page_sections")
        .select("id")
        .eq("section_key", sectionKey)
        .single();
      return data;
    },
  });

  const { data: resources = [] } = useQuery({
    queryKey: ["resources", section?.id],
    queryFn: async () => {
      if (!section?.id) return [];
      const { data } = await supabase
        .from("resources")
        .select("*")
        .eq("section_id", section.id)
        .order("sort_order");
      return data ?? [];
    },
    enabled: !!section?.id,
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      if (!section?.id) return;
      const maxOrder = resources.length > 0 ? Math.max(...resources.map(r => r.sort_order ?? 0)) + 1 : 0;
      await supabase.from("resources").insert({
        section_id: section.id,
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

  // Show resources for everyone, edit controls only in edit mode
  if (resources.length === 0 && !editMode) return null;

  return (
    <div className="mt-6">
      {resources.length > 0 && (
        <div className="mb-3">
          <h4 className="text-sm font-sans font-semibold text-muted-foreground mb-2">📚 延伸資源</h4>
          <div className="space-y-2">
            <AnimatePresence>
              {resources.map((r, idx) => (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-start gap-2 p-3 rounded-lg border border-border bg-muted/20"
                >
                  {editMode && (
                    <div className="flex flex-col gap-1 pt-1">
                      <button onClick={() => moveMutation.mutate({ id: r.id, direction: "up" })} disabled={idx === 0} className="text-muted-foreground hover:text-foreground disabled:opacity-30 text-xs">▲</button>
                      <GripVertical className="w-3 h-3 text-muted-foreground" />
                      <button onClick={() => moveMutation.mutate({ id: r.id, direction: "down" })} disabled={idx === resources.length - 1} className="text-muted-foreground hover:text-foreground disabled:opacity-30 text-xs">▼</button>
                    </div>
                  )}
                  {editingId === r.id ? (
                    <div className="flex-1 space-y-2">
                      <Input value={editTitle} onChange={e => setEditTitle(e.target.value)} placeholder="標題" className="h-8 text-sm" />
                      <Input value={editUrl} onChange={e => setEditUrl(e.target.value)} placeholder="網址" className="h-8 text-sm" />
                      <Textarea value={editDesc} onChange={e => setEditDesc(e.target.value)} placeholder="描述" className="min-h-[60px] text-sm" />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => updateMutation.mutate(r.id)} className="h-7 text-xs"><Check className="w-3 h-3 mr-1" />儲存</Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingId(null)} className="h-7 text-xs"><X className="w-3 h-3 mr-1" />取消</Button>
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
                  {editMode && editingId !== r.id && (
                    <div className="flex gap-1">
                      <button onClick={() => { setEditingId(r.id); setEditTitle(r.title); setEditUrl(r.url ?? ""); setEditDesc(r.description ?? ""); }} className="text-muted-foreground hover:text-foreground p-1"><Pencil className="w-3 h-3" /></button>
                      <button onClick={() => deleteMutation.mutate(r.id)} className="text-muted-foreground hover:text-destructive p-1"><Trash2 className="w-3 h-3" /></button>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {editMode && !adding && (
        <Button size="sm" variant="outline" onClick={() => setAdding(true)} className="h-8 text-xs border-dashed">
          <Plus className="w-3 h-3 mr-1" />新增資源
        </Button>
      )}

      {editMode && adding && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-lg border border-primary/30 bg-muted/20 space-y-2">
          <Input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="資源標題 *" className="h-8 text-sm" />
          <Input value={newUrl} onChange={e => setNewUrl(e.target.value)} placeholder="網址（選填）" className="h-8 text-sm" />
          <Textarea value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="描述（選填）" className="min-h-[60px] text-sm" />
          <div className="flex gap-2">
            <Button size="sm" onClick={() => addMutation.mutate()} disabled={!newTitle.trim()} className="h-7 text-xs"><Plus className="w-3 h-3 mr-1" />新增</Button>
            <Button size="sm" variant="ghost" onClick={() => { setAdding(false); setNewTitle(""); setNewUrl(""); setNewDesc(""); }} className="h-7 text-xs">取消</Button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ResourceEditor;
