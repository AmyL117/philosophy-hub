import { useAuth } from "@/hooks/useAuth";
import { useMembership, TIER_LABELS, type MembershipTier } from "@/hooks/useMembership";
import { useEditMode } from "@/contexts/EditModeContext";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { LogIn, LogOut, Pencil, PencilOff, Settings, Eye, Crown, Star, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

const TIER_ICONS: Record<MembershipTier, typeof User> = {
  free_member: User,
  paid_member: Star,
  premium_member: Crown,
};

const TIER_BADGE_COLORS: Record<MembershipTier, string> = {
  free_member: "bg-muted/50 text-foreground/70 border-border",
  paid_member: "bg-primary/15 text-primary border-primary/30",
  premium_member: "bg-secondary/15 text-secondary border-secondary/30",
};

const AuthButtons = () => {
  const { user, loading, isAdmin, isRealAdmin, viewAsAdmin, setViewAsAdmin, signInWithGoogle, signOut } = useAuth();
  const { tier } = useMembership();
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

  const currentTier = tier ?? "free_member";
  const TierIcon = TIER_ICONS[currentTier];

  return (
    <div className="flex items-center gap-2">
      {/* User info badge */}
      <div className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-sans ${TIER_BADGE_COLORS[currentTier]}`}>
        <TierIcon className="w-3 h-3" />
        <span className="max-w-[120px] truncate">{user.email}</span>
        <span className="opacity-60">·</span>
        <span className="font-semibold whitespace-nowrap">{TIER_LABELS[currentTier]}</span>
      </div>

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
