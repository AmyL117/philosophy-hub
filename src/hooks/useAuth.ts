import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import type { User } from "@supabase/supabase-js";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewAsAdmin, setViewAsAdmin] = useState(true);
  const [isRealAdmin, setIsRealAdmin] = useState(false);
  const isAdmin = isRealAdmin && viewAsAdmin;

  useEffect(() => {
    let mounted = true;

    const forceFinishTimer = window.setTimeout(() => {
      if (mounted) setLoading(false);
    }, 4000);

    const refreshAdmin = async (u: User | null) => {
      if (!u) {
        if (mounted) setIsRealAdmin(false);
        return;
      }
      try {
        const { data, error } = await supabase.rpc("is_admin");
        if (!mounted) return;
        setIsRealAdmin(!error && data === true);
      } catch {
        if (mounted) setIsRealAdmin(false);
      }
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      const u = session?.user ?? null;
      setUser(u);
      setLoading(false);
      // Defer to avoid deadlock inside auth callback
      setTimeout(() => void refreshAdmin(u), 0);
    });

    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        if (!mounted) return;
        const u = session?.user ?? null;
        setUser(u);
        setLoading(false);
        void refreshAdmin(u);
      })
      .catch(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
      window.clearTimeout(forceFinishTimer);
      subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: `${window.location.origin}/content`,
      extraParams: {
        prompt: "select_account",
      },
    });

    if ((result as any)?.error) {
      throw (result as any).error;
    }

    return result;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return { user, loading, isAdmin, isRealAdmin, viewAsAdmin, setViewAsAdmin, signInWithGoogle, signOut };
}

