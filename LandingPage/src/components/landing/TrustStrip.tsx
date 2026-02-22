import { motion, useInView } from "framer-motion";
import { Zap } from "lucide-react";
import { useRef, useEffect, useState } from "react";

const badges = [
  "Built with Lingo.dev",
  "Powered by Gemini AI",
  "Chrome Manifest V3",
  "Built for Global Web",
];

const stats = [
  { value: 50, suffix: "+", label: "Languages Supported" },
  { value: 10, suffix: "K+", label: "Translations Made" },
  { value: 2, suffix: "K+", label: "Active Users" },
  { value: 99, suffix: "%", label: "Accuracy Rate" },
];

const AnimatedCounter = ({ value, suffix, label }: { value: number; suffix: string; label: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const duration = 1500;
    const step = Math.max(1, Math.floor(duration / value));
    const timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start >= value) clearInterval(timer);
    }, step);
    return () => clearInterval(timer);
  }, [isInView, value]);

  return (
    <div ref={ref} className="text-center">
      <div className="text-3xl sm:text-4xl font-black text-foreground">
        {count}
        <span className="text-primary">{suffix}</span>
      </div>
      <div className="text-xs text-muted-foreground mt-1 tracking-wide">{label}</div>
    </div>
  );
};

const TrustStrip = () => (
  <section className="border-y border-border bg-card/50">
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
      {/* Animated stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map((s) => (
          <AnimatedCounter key={s.label} {...s} />
        ))}
      </div>

      {/* Badge row */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="flex flex-wrap justify-center gap-8 md:gap-16 pt-6 border-t border-border"
      >
        {badges.map((item) => (
          <div key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
            <Zap size={14} className="text-primary" />
            <span>{item}</span>
          </div>
        ))}
      </motion.div>
    </div>
  </section>
);

export default TrustStrip;
