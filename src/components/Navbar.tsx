import { motion } from "framer-motion";
import { Brain, Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import AuthButtons from "./AuthButtons";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-background/70 border-b border-border"
    >
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2">
          <Brain className="w-6 h-6 text-primary" />
          <span className="font-serif font-bold text-lg text-foreground">ME TIME · 思維實驗室</span>
        </a>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#stats" className="text-sm font-sans text-muted-foreground hover:text-foreground transition-colors">數據</a>
          <a href="#topics" className="text-sm font-sans text-muted-foreground hover:text-foreground transition-colors">主題</a>
          <a href="#articles" className="text-sm font-sans text-muted-foreground hover:text-foreground transition-colors">文章</a>
          <a href="#about" className="text-sm font-sans text-muted-foreground hover:text-foreground transition-colors">關於</a>
          {user && (
            <a href="/content" className="text-sm font-sans font-semibold text-primary hover:text-primary/80 transition-colors">會員專區</a>
          )}
          <AuthButtons />
        </div>

        {/* Mobile toggle */}
        <div className="md:hidden flex items-center gap-2">
          <AuthButtons />
          <button onClick={() => setOpen(!open)} className="text-foreground">
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="md:hidden border-t border-border bg-background/95 backdrop-blur-xl"
        >
          <div className="flex flex-col p-4 gap-4">
            <a href="#stats" onClick={() => setOpen(false)} className="text-sm font-sans text-muted-foreground hover:text-foreground">數據</a>
            <a href="#topics" onClick={() => setOpen(false)} className="text-sm font-sans text-muted-foreground hover:text-foreground">主題</a>
            <a href="#articles" onClick={() => setOpen(false)} className="text-sm font-sans text-muted-foreground hover:text-foreground">文章</a>
            <a href="#about" onClick={() => setOpen(false)} className="text-sm font-sans text-muted-foreground hover:text-foreground">關於</a>
            {user && (
              <a href="/content" onClick={() => setOpen(false)} className="text-sm font-sans font-semibold text-primary hover:text-primary/80">會員專區</a>
            )}
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
};

export default Navbar;
