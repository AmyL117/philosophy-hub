import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Brain, Eye, Heart, Compass, Puzzle, Flame, Leaf, Zap } from "lucide-react";

const topics = [
  {
    icon: Brain,
    title: "認知心理學",
    desc: "探索思維模式、決策偏誤與記憶機制，了解大腦如何處理訊息",
    articles: 28,
    gradient: "from-primary to-secondary",
  },
  {
    icon: Eye,
    title: "存在主義",
    desc: "從沙特到卡繆，探討自由、荒謬與存在的本質意義",
    articles: 22,
    gradient: "from-secondary to-primary",
  },
  {
    icon: Heart,
    title: "情緒心理學",
    desc: "解析情緒的形成機制，學習情緒管理與自我調節策略",
    articles: 18,
    gradient: "from-accent to-primary",
  },
  {
    icon: Compass,
    title: "倫理學",
    desc: "從功利主義到德行倫理，探討道德判斷的基礎與困境",
    articles: 15,
    gradient: "from-primary to-accent",
  },
  {
    icon: Puzzle,
    title: "行為經濟學",
    desc: "結合心理學與經濟學，揭示非理性決策背後的邏輯",
    articles: 12,
    gradient: "from-secondary to-accent",
  },
  {
    icon: Flame,
    title: "精神分析",
    desc: "從佛洛伊德到拉岡，探索潛意識的深層結構",
    articles: 14,
    gradient: "from-accent to-secondary",
  },
  {
    icon: Leaf,
    title: "正念與冥想",
    desc: "科學實證的正念練習，提升專注力與心理健康",
    articles: 10,
    gradient: "from-primary to-secondary",
  },
  {
    icon: Zap,
    title: "神經科學",
    desc: "最新腦科學研究，從神經元到意識的探索之旅",
    articles: 8,
    gradient: "from-secondary to-primary",
  },
];

const TopicsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="topics" className="py-24 px-4" ref={ref}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold font-serif mb-4">
            <span className="text-gradient-purple">探索主題</span>
          </h2>
          <p className="text-muted-foreground font-sans text-lg max-w-xl mx-auto">
            八大核心領域，系統化的知識架構
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {topics.map((topic, i) => (
            <motion.div
              key={topic.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="group relative bg-gradient-card rounded-xl border border-border p-6 hover:border-primary/40 transition-all duration-300 cursor-pointer overflow-hidden"
            >
              {/* Hover glow */}
              <div className={`absolute inset-0 bg-gradient-to-br ${topic.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

              <div className="relative z-10">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${topic.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <topic.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-serif font-bold text-foreground mb-2">{topic.title}</h3>
                <p className="text-sm text-muted-foreground font-sans leading-relaxed mb-4">{topic.desc}</p>
                <div className="text-xs font-sans text-primary font-semibold">{topic.articles} 篇文章</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TopicsSection;
