import { useAuth } from "@/hooks/useAuth";
import { useEditMode } from "@/contexts/EditModeContext";
import { Button } from "@/components/ui/button";
import { LogIn, LogOut, Pencil, PencilOff, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AuthButtons = () => {
  const { user, loading, isAdmin, signInWithGoogle, signOut } = useAuth();
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
