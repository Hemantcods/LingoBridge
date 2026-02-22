import { motion } from "framer-motion";
import { Play } from "lucide-react";

const HeroMockup = () => (
  <div className="relative w-full max-w-md">
    <div className="bg-card border border-border rounded-xl p-4 space-y-3 font-mono text-sm">
      {/* Selected text */}
      <div className="space-y-1">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Selected Text</div>
        <div className="bg-primary/10 border border-primary/20 rounded-lg px-3 py-2 text-muted-foreground">
          <span className="text-foreground bg-primary/20 px-1 rounded">Die Zukunft gehört denen, die an die Schönheit ihrer Träume glauben.</span>
        </div>
      </div>

      {/* Skeleton loading */}
      <div className="space-y-1">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Translating...</div>
        <div className="space-y-2 py-2">
          <div className="h-3 bg-primary/10 rounded-full w-full animate-pulse" />
          <div className="h-3 bg-primary/10 rounded-full w-3/4 animate-pulse" style={{ animationDelay: "0.2s" }} />
        </div>
      </div>

      {/* Translated */}
      <div className="space-y-1">
        <div className="text-[10px] uppercase tracking-widest text-primary">Translated</div>
        <div className="bg-elevated border border-border rounded-lg px-3 py-2 text-foreground">
          The future belongs to those who believe in the beauty of their dreams.
        </div>
      </div>

      {/* AI Summary overlay */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="bg-card border border-primary/30 rounded-lg px-3 py-2 glow-green"
      >
        <div className="text-[10px] uppercase tracking-widest text-primary mb-1">✨ AI Summary</div>
        <div className="text-xs text-muted-foreground leading-relaxed">
          An inspirational quote about pursuing dreams and having faith in one's aspirations for the future.
        </div>
      </motion.div>
    </div>
  </div>
);

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-grid opacity-30" />
      <div className="absolute inset-0 bg-radial-glow" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] animate-pulse-glow" />

      <div className="relative max-w-6xl mx-auto px-6 w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card text-xs text-muted-foreground mb-8">
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
              AI-powered Chrome Extension
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[0.95] mb-6">
              <span className="text-foreground">Browse.</span>
              <br />
              <span className="text-gradient-green">Translate.</span>
              <br />
              <span className="text-foreground">Summarize.</span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-lg mb-10 leading-relaxed">
              Break language barriers instantly — translate and summarize content directly inside any webpage without leaving your browsing flow.
            </p>

            <div className="flex flex-wrap gap-4">
              <a
                href="https://github.com/Hemantcods/LingoBridge"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 font-semibold bg-primary text-primary-foreground rounded-lg hover:brightness-110 transition-all glow-green-strong text-sm"
              >
                Add to Chrome — It's Free
              </a>
              <button className="px-6 py-3 font-semibold border border-border text-foreground rounded-lg hover:bg-secondary transition-all text-sm inline-flex items-center gap-2">
                <Play size={14} />
                Watch Demo
              </button>
            </div>
          </motion.div>

          {/* Right mockup */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="hidden lg:flex justify-center"
          >
            <div className="animate-float">
              <HeroMockup />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
