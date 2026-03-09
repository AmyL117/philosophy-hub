import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import type { User } from "@supabase/supabase-js";

const ADMIN_EMAILS = ["silvestersss89@gmail.com", "amypy117@gmail.com"];

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewAsAdmin, setViewAsAdmin] = useState(true);
  const isRealAdmin = ADMIN_EMAILS.includes(user?.email ?? "");
  const isAdmin = isRealAdmin && viewAsAdmin;

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
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
