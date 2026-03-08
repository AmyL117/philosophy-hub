import { Brain, Instagram } from "lucide-react";

const FooterSection = () => {
  return (
    <footer id="about" className="py-16 px-4 border-t border-border">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Brain className="w-6 h-6 text-primary" />
              <span className="font-serif font-bold text-lg text-foreground">ME TIME · 哲心探秘錄</span>
            </div>
            <p className="text-sm text-muted-foreground font-sans leading-relaxed">
              一個致力於推廣哲學與心理學知識的平台，以深入淺出的方式探索人類思維的奧秘。
            </p>
          </div>

          <div>
            <h4 className="font-serif font-bold text-foreground mb-4">快速導航</h4>
            <div className="flex flex-col gap-2">
              <a href="#stats" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-sans">數據一覽</a>
              <a href="#topics" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-sans">探索主題</a>
              <a href="#articles" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-sans">精選文章</a>
            </div>
          </div>

          <div>
            <h4 className="font-serif font-bold text-foreground mb-4">聯繫我們</h4>
            <a
              href="https://www.instagram.com/lazy_day_z/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-sans text-muted-foreground hover:text-primary transition-colors"
            >
              <Instagram className="w-4 h-4" />
              @lazy_day_z
            </a>
          </div>
        </div>

        <div className="pt-8 border-t border-border text-center">
          <p className="text-xs text-muted-foreground font-sans">
            © {new Date().getFullYear()} ME TIME · 思維實驗室. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
