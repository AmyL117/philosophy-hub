import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Quote } from "lucide-react";
import ResourceEditor from "./ResourceEditor";

const quotes = [
  { text: "未經審視的人生不值得過。", author: "蘇格拉底", field: "古希臘哲學" },
  { text: "人是被判定為自由的。", author: "尚-保羅·沙特", field: "存在主義" },
  { text: "知道自己不知道，才是真正的知識。", author: "蘇格拉底", field: "認識論" },
];

const QuoteSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="py-24 px-4 relative overflow-hidden" ref={ref}>
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-accent/5 blur-[120px]" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold font-serif mb-4">
            <span className="text-gradient-aurora">思想之光</span>
          </h2>
        </motion.div>

        <div className="space-y-8">
          {quotes.map((q, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.2 }}
              className="bg-gradient-card rounded-xl border border-border p-8 relative"
            >
              <Quote className="absolute top-6 left-6 w-8 h-8 text-primary/20" />
              <blockquote className="text-xl md:text-2xl font-serif text-foreground italic pl-12 mb-4">
                「{q.text}」
              </blockquote>
              <div className="pl-12 flex items-center gap-3">
                <span className="text-sm font-sans font-semibold text-foreground">{q.author}</span>
                <span className="text-xs font-sans text-muted-foreground">· {q.field}</span>
              </div>
            </motion.div>
          ))}
        </div>
        <ResourceEditor sectionKey="quotes" />
      </div>
    </section>
  );
};

export default QuoteSection;
