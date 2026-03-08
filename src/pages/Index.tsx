import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import StatsSection from "@/components/StatsSection";
import TopicsSection from "@/components/TopicsSection";
import FeaturedArticles from "@/components/FeaturedArticles";
import QuoteSection from "@/components/QuoteSection";
import FooterSection from "@/components/FooterSection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <StatsSection />
      <TopicsSection />
      <div id="articles">
        <FeaturedArticles />
      </div>
      <QuoteSection />
      <FooterSection />
    </div>
  );
};

export default Index;
