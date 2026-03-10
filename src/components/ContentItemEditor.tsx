import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Pencil, Check, X, ChevronUp, ChevronDown, Type, Hash, Calendar, ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ContentItemEditorProps {
  category: string;
  isAdmin: boolean;
}

type ItemType = "text" | "number" | "date" | "image";

const TYPE_OPTIONS: { value: ItemType; label: string; icon: typeof Type }[] = [
  { value: "text", label: "文字", icon: Type },
  { value: "number", label: "數字", icon: Hash },
  { value: "date", label: "日期", icon: Calendar },
  { value: "image", label: "圖片", icon: ImageIcon },
];

const ContentItemEditor = ({ category, isAdmin }: ContentItemEditorProps) => {
  const queryClient = useQueryClient();
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newLabel, setNewLabel] = useState("");
  const [newValue, setNewValue] = useState("");
  const [newType, setNewType] = useState<ItemType>("text");
  const [editLabel, setEditLabel] = useState("");
  const [editValue, setEditValue] = useState("");
  const [editType, setEditType] = useState<ItemType>("text");

  const { data: items = [] } = useQuery({
    queryKey: ["content_items", category],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("content_items")
        .select("*")
        .eq("category", category)
        .order("sort_order");
      if (error) throw error;
      return data ?? [];
    },
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      const maxOrder = items.length > 0 ? Math.max(...items.map((i: any) => i.sort_order ?? 0)) + 1 : 0;
      const { error } = await supabase.from("content_items").insert({
        category,
        label: newLabel,
        value: newValue || null,
        item_type: newType,
        sort_order: maxOrder,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content_items", category] });
      setAdding(false);
      setNewLabel("");
      setNewValue("");
      setNewType("text");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("content_items").update({
        label: editLabel,
        value: editValue || null,
        item_type: editType,
      }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content_items", category] });
      setEditingId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("content_items").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["content_items", category] }),
  });

  const moveMutation = useMutation({
    mutationFn: async ({ id, direction }: { id: string; direction: "up" | "down" }) => {
      const idx = items.findIndex((i: any) => i.id === id);
      if (idx < 0) return;
      const swapIdx = direction === "up" ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= items.length) return;
      const current = items[idx];
      const swap = items[swapIdx];
      await supabase.from("content_items").update({ sort_order: swap.sort_order }).eq("id", current.id);
      await supabase.from("content_items").update({ sort_order: current.sort_order }).eq("id", swap.id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["content_items", category] }),
  });

  const renderValue = (item: any) => {
    switch (item.item_type) {
      case "image":
        return item.value ? (
          <img src={item.value} alt={item.label} className="mt-1 rounded-lg max-h-40 object-cover" />
        ) : (
          <span className="text-xs text-muted-foreground italic">（未設定圖片）</span>
        );
      case "date":
        return <span className="text-sm font-sans text-foreground">{item.value || "—"}</span>;
      case "number":
        return <span className="text-sm font-mono text-foreground">{item.value || "—"}</span>;
      default:
        return <p className="text-sm font-sans text-foreground whitespace-pre-wrap">{item.value || "—"}</p>;
    }
  };

  const renderInput = (type: ItemType, value: string, onChange: (v: string) => void) => {
    switch (type) {
      case "image":
        return <Input value={value} onChange={e => onChange(e.target.value)} placeholder="圖片網址 (URL)" className="h-8 text-sm" />;
      case "date":
        return <Input type="date" value={value} onChange={e => onChange(e.target.value)} className="h-8 text-sm" />;
      case "number":
        return <Input type="number" value={value} onChange={e => onChange(e.target.value)} placeholder="數字" className="h-8 text-sm" />;
      default:
        return <Textarea value={value} onChange={e => onChange(e.target.value)} placeholder="內容文字" className="min-h-[60px] text-sm" />;
    }
  };

  if (items.length === 0 && !isAdmin) return null;

  return (
    <div className="space-y-3">
      <AnimatePresence>
        {items.map((item: any, idx: number) => (
          <motion.div
            key={item.id}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-xl border border-border bg-card"
          >
            {editingId === item.id ? (
              <div className="space-y-3">
                <Input value={editLabel} onChange={e => setEditLabel(e.target.value)} placeholder="標題" className="h-8 text-sm font-semibold" />
                <div className="flex gap-2">
                  {TYPE_OPTIONS.map(t => (
                    <button
                      key={t.value}
                      onClick={() => setEditType(t.value)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-sans transition-all border ${
                        editType === t.value
                          ? "bg-primary/20 text-primary border-primary/30"
                          : "bg-transparent text-muted-foreground border-transparent hover:border-border"
                      }`}
                    >
                      <t.icon className="w-3 h-3" />
                      {t.label}
                    </button>
                  ))}
                </div>
                {renderInput(editType, editValue, setEditValue)}
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => updateMutation.mutate(item.id)} className="h-7 text-xs">
                    <Check className="w-3 h-3 mr-1" />儲存
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditingId(null)} className="h-7 text-xs">
                    <X className="w-3 h-3 mr-1" />取消
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h4 className="text-sm font-sans font-semibold text-foreground">{item.label}</h4>
                    <div className="mt-1">{renderValue(item)}</div>
                  </div>
                  {isAdmin && (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => moveMutation.mutate({ id: item.id, direction: "up" })}
                        disabled={idx === 0}
                        className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => moveMutation.mutate({ id: item.id, direction: "down" })}
                        disabled={idx === items.length - 1}
                        className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingId(item.id);
                          setEditLabel(item.label);
                          setEditValue(item.value ?? "");
                          setEditType(item.item_type as ItemType);
                        }}
                        className="p-1 text-muted-foreground hover:text-foreground"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteMutation.mutate(item.id)}
                        className="p-1 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>

      {isAdmin && !adding && (
        <Button size="sm" variant="outline" onClick={() => setAdding(true)} className="h-8 text-xs border-dashed w-full">
          <Plus className="w-3 h-3 mr-1" />新增內容
        </Button>
      )}

      {isAdmin && adding && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-xl border border-primary/30 bg-muted/20 space-y-3">
          <Input value={newLabel} onChange={e => setNewLabel(e.target.value)} placeholder="標題 *" className="h-8 text-sm font-semibold" />
          <div className="flex gap-2">
            {TYPE_OPTIONS.map(t => (
              <button
                key={t.value}
                onClick={() => setNewType(t.value)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-sans transition-all border ${
                  newType === t.value
                    ? "bg-primary/20 text-primary border-primary/30"
                    : "bg-transparent text-muted-foreground border-transparent hover:border-border"
                }`}
              >
                <t.icon className="w-3 h-3" />
                {t.label}
              </button>
            ))}
          </div>
          {renderInput(newType, newValue, setNewValue)}
          <div className="flex gap-2">
            <Button size="sm" onClick={() => addMutation.mutate()} disabled={!newLabel.trim()} className="h-7 text-xs">
              <Plus className="w-3 h-3 mr-1" />新增
            </Button>
            <Button size="sm" variant="ghost" onClick={() => { setAdding(false); setNewLabel(""); setNewValue(""); setNewType("text"); }} className="h-7 text-xs">
              取消
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ContentItemEditor;
