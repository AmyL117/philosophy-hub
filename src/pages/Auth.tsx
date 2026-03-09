import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Mail, Lock, ArrowLeft, LogIn, UserPlus } from "lucide-react";

const Auth = () => {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    setLoading(true);

    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast({ title: "註冊成功", description: "請查看你的電郵信箱進行驗證" });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        toast({ title: "登入成功" });
        navigate("/content");
      }
    } catch (err: any) {
      let description = err.message;
      if (err.message === "Invalid login credentials") {
        description = "登入資料不正確；如果你是用 Google 註冊，請改用上方 Google 登入，或先按「立即註冊」建立密碼帳號。";
      }
      toast({ title: "錯誤", description, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: `${window.location.origin}/content`,
        extraParams: {
          prompt: "select_account",
        },
      });

      if ((result as any)?.error) {
        throw (result as any).error;
      }

      if (!(result as any)?.redirected) {
        toast({ title: "登入成功" });
        navigate("/content");
      }
    } catch (err: any) {
      const isPreview = window.location.hostname.includes("lovableproject.com");
      toast({
        title: "錯誤",
        description: isPreview
          ? "Google 登入在預覽環境可能被瀏覽器限制，請允許彈出視窗，或改到已發佈網站登入。"
          : err?.message ?? "Google 登入失敗，請稍後再試。",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <button onClick={() => navigate("/")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors font-sans">
          <ArrowLeft className="w-4 h-4" />返回首頁
        </button>

        <div className="text-center space-y-1">
          <h1 className="text-2xl font-serif font-bold text-foreground">
            {mode === "login" ? "會員登入" : "註冊帳號"}
          </h1>
          <p className="text-sm text-muted-foreground font-sans">
            {mode === "login" ? "歡迎回來" : "使用任何電郵即可註冊"}
          </p>
        </div>

        {/* Google */}
        <Button variant="outline" className="w-full gap-2 font-sans" onClick={handleGoogle} disabled={loading}>
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          以 Google 帳號{mode === "login" ? "登入" : "註冊"}
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
          <div className="relative flex justify-center text-xs"><span className="bg-background px-2 text-muted-foreground font-sans">或使用電郵</span></div>
        </div>

        {/* Email form */}
        <form onSubmit={handleEmailAuth} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-sans">電子郵件</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="pl-9" required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-sans">密碼</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="至少 6 個字元" className="pl-9" minLength={6} required />
            </div>
          </div>
          <Button type="submit" className="w-full gap-2 font-sans" disabled={loading}>
            {mode === "login" ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            {loading ? "處理中..." : mode === "login" ? "登入" : "註冊"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground font-sans">
          {mode === "login" ? "還沒有帳號？" : "已有帳號？"}
          <button onClick={() => setMode(mode === "login" ? "signup" : "login")} className="ml-1 text-primary hover:underline font-semibold">
            {mode === "login" ? "立即註冊" : "返回登入"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Auth;
