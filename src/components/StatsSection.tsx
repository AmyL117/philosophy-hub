import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { BookOpen, Users, Lightbulb, Clock, TrendingUp, Globe } from "lucide-react";
import ResourceEditor from "./ResourceEditor";

const stats = [
  { icon: BookOpen, label: "精選文章", value: "120+", desc: "深度哲學與心理學分析", color: "text-primary" },
  { icon: Users, label: "讀者社群", value: "8,500+", desc: "來自全球的思考者", color: "text-secondary" },
  { icon: Lightbulb, label: "核心理論", value: "45", desc: "涵蓋各大學派", color: "text-accent" },
  { icon: Clock, label: "閱讀時數", value: "2,300+", desc: "累計讀者投入時間", color: "text-primary" },
  { icon: TrendingUp, label: "月增長率", value: "23%", desc: "持續穩定成長中", color: "text-secondary" },
  { icon: Globe, label: "覆蓋地區", value: "30+", desc: "輻射全球華語圈", color: "text-accent" },
];

const StatsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="stats" className="py-24 px-4" ref={ref}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold font-serif mb-4">
            <span className="text-gradient-warm">數據一覽</span>
          </h2>
          <p className="text-muted-foreground font-sans text-lg max-w-xl mx-auto">
            用數字說話，見證我們的成長軌跡
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-gradient-card rounded-xl border border-border p-6 md:p-8 hover:border-primary/30 transition-all duration-300 group"
            >
              <stat.icon className={`w-8 h-8 ${stat.color} mb-4 group-hover:scale-110 transition-transform`} />
              <div className="text-3xl md:text-4xl font-bold font-serif text-foreground mb-1">
                {stat.value}
              </div>
              <div className="text-sm font-sans font-semibold text-foreground mb-1">{stat.label}</div>
              <div className="text-xs font-sans text-muted-foreground">{stat.desc}</div>
            </motion.div>
          ))}
        </div>
        <ResourceEditor sectionKey="stats" />
      </div>
    </section>
  );
};

export default StatsSection;
