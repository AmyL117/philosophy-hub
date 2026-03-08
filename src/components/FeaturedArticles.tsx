import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight, Clock, Eye } from "lucide-react";
import ResourceEditor from "./ResourceEditor";

const articles = [
  {
    title: "為什麼我們害怕自由？——沙特的存在焦慮",
    category: "存在主義",
    readTime: "8 分鐘",
    views: "3.2K",
    excerpt: "沙特說「人是被判定為自由的」。這份自由不是禮物，而是一種無法逃避的負擔⋯⋯",
    featured: true,
  },
  {
    title: "認知偏誤：你的大腦正在欺騙你",
    category: "認知心理學",
    readTime: "6 分鐘",
    views: "5.1K",
    excerpt: "從確認偏誤到錨定效應，了解12種最常見的思維陷阱。",
    featured: false,
  },
  {
    title: "冥想科學：每天10分鐘改變大腦結構",
    category: "正念與冥想",
    readTime: "5 分鐘",
    views: "4.8K",
    excerpt: "哈佛研究證實，持續8週的正念冥想能顯著改變灰質密度。",
    featured: false,
  },
  {
    title: "尼采的超人哲學：重新定義人生意義",
    category: "倫理學",
    readTime: "10 分鐘",
    views: "2.9K",
    excerpt: "「上帝已死」之後，我們如何為生命創造自己的價值？",
    featured: false,
  },
  {
    title: "依附理論：童年如何塑造你的愛情模式",
    category: "情緒心理學",
    readTime: "7 分鐘",
    views: "6.3K",
    excerpt: "安全型、焦慮型、迴避型——你的依附風格決定了你的親密關係。",
    featured: false,
  },
];

const FeaturedArticles = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="py-24 px-4" ref={ref}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="flex items-end justify-between mb-12"
        >
          <div>
            <h2 className="text-3xl md:text-5xl font-bold font-serif mb-4">
              <span className="text-gradient-blue">精選文章</span>
            </h2>
            <p className="text-muted-foreground font-sans text-lg">
              最受歡迎的深度思考
            </p>
          </div>
          <a href="#" className="hidden md:inline-flex items-center gap-2 text-primary font-sans font-semibold text-sm hover:gap-3 transition-all">
            查看全部 <ArrowRight className="w-4 h-4" />
          </a>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Featured large card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="lg:row-span-2 bg-gradient-card rounded-xl border border-border p-8 hover:border-primary/40 transition-all duration-300 cursor-pointer group flex flex-col justify-between min-h-[320px]"
          >
            <div>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-sans font-semibold bg-primary/20 text-primary mb-4">
                {articles[0].category}
              </span>
              <h3 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-4 group-hover:text-primary transition-colors leading-tight">
                {articles[0].title}
              </h3>
              <p className="text-muted-foreground font-sans leading-relaxed">
                {articles[0].excerpt}
              </p>
            </div>
            <div className="flex items-center gap-4 mt-6 text-xs text-muted-foreground font-sans">
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{articles[0].readTime}</span>
              <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{articles[0].views} 次閱讀</span>
            </div>
          </motion.div>

          {/* Smaller cards */}
          {articles.slice(1).map((article, i) => (
            <motion.div
              key={article.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: (i + 1) * 0.1 }}
              className="bg-gradient-card rounded-xl border border-border p-6 hover:border-secondary/40 transition-all duration-300 cursor-pointer group"
            >
              <span className="inline-block px-3 py-1 rounded-full text-xs font-sans font-semibold bg-secondary/20 text-secondary mb-3">
                {article.category}
              </span>
              <h3 className="text-base md:text-lg font-serif font-bold text-foreground mb-2 group-hover:text-secondary transition-colors leading-snug">
                {article.title}
              </h3>
              <p className="text-sm text-muted-foreground font-sans line-clamp-2">{article.excerpt}</p>
              <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground font-sans">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{article.readTime}</span>
                <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{article.views}</span>
              </div>
            </motion.div>
          ))}
        </div>
        <ResourceEditor sectionKey="articles" />
      </div>
    </section>
  );
};

export default FeaturedArticles;
