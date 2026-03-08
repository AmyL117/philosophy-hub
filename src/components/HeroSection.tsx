import { motion } from "framer-motion";
import { Brain, Sparkles } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden px-4">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 left-[10%] w-72 h-72 rounded-full bg-primary/10 blur-[100px]"
          animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 right-[10%] w-96 h-96 rounded-full bg-secondary/10 blur-[120px]"
          animate={{ x: [0, -40, 0], y: [0, 30, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-accent/8 blur-[80px]"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative z-10 text-center max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-muted/50 backdrop-blur-sm mb-8">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground font-sans">探索心靈的深度 · 解鎖思維的力量</span>
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl md:text-7xl lg:text-8xl font-bold font-serif mb-6 leading-tight"
        >
          <span className="text-gradient-purple">哲學</span>
          <span className="text-foreground"> × </span>
          <span className="text-gradient-blue">心理學</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-lg md:text-xl text-muted-foreground font-sans max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          由 <span className="text-foreground font-semibold">IU</span> 主理，深入探索存在主義、認知心理學、正念冥想等領域。
          以數據驅動的方式，帶你走進人類思維的奧秘。
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <a
            href="#topics"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg bg-primary text-primary-foreground font-sans font-semibold text-base hover:opacity-90 transition-opacity glow-purple"
          >
            <Brain className="w-5 h-5" />
            開始探索
          </a>
          <a
            href="#stats"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg border border-border bg-muted/30 text-foreground font-sans font-semibold text-base hover:bg-muted/50 transition-colors backdrop-blur-sm"
          >
            瀏覽數據
          </a>
        </motion.div>

        {/* Floating brain icon */}
        <motion.div
          className="absolute -bottom-10 right-0 md:right-10 opacity-10"
          animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          <Brain className="w-32 h-32 md:w-48 md:h-48 text-primary" />
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
