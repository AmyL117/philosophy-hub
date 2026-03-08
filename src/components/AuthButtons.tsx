import { useAuth } from "@/hooks/useAuth";
import { useEditMode } from "@/contexts/EditModeContext";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { LogIn, LogOut, Pencil, PencilOff, Settings, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AuthButtons = () => {
  const { user, loading, isAdmin, isRealAdmin, viewAsAdmin, setViewAsAdmin, signInWithGoogle, signOut } = useAuth();
  const { editMode, setEditMode } = useEditMode();
  const navigate = useNavigate();

  if (loading) return null;

  if (!user) {
    return (
      <Button size="sm" variant="outline" onClick={signInWithGoogle} className="h-8 text-xs gap-1.5 font-sans">
        <LogIn className="w-3.5 h-3.5" />
        Google 登入
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {isRealAdmin && (
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/30 border border-border">
          <Eye className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-[10px] font-sans text-muted-foreground">{viewAsAdmin ? "管理員" : "會員"}</span>
          <Switch
            checked={viewAsAdmin}
            onCheckedChange={(v) => {
              setViewAsAdmin(v);
              if (!v) setEditMode(false);
            }}
            className="scale-75 origin-center"
          />
        </div>
      )}
      {isAdmin && (
        <>
          <Button
            size="sm"
            variant={editMode ? "default" : "outline"}
            onClick={() => setEditMode(!editMode)}
            className="h-8 text-xs gap-1.5 font-sans"
          >
            {editMode ? <PencilOff className="w-3.5 h-3.5" /> : <Pencil className="w-3.5 h-3.5" />}
            {editMode ? "退出編輯" : "編輯模式"}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => navigate("/admin")}
            className="h-8 w-8 p-0"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </>
      )}
      <Button size="sm" variant="ghost" onClick={signOut} className="h-8 text-xs gap-1.5 font-sans text-muted-foreground">
        <LogOut className="w-3.5 h-3.5" />
        登出
      </Button>
    </div>
  );
};

export default AuthButtons;
