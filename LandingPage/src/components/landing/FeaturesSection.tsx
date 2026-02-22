import { motion } from "framer-motion";
import { Globe, Brain, Palette, MousePointer } from "lucide-react";

const features = [
  {
    icon: Globe,
    title: "Contextual In-Place Translation",
    bullets: ["Replaces selected text instantly", "Preserves original styles", "No page reload"],
  },
  {
    icon: Brain,
    title: "AI Summarization",
    bullets: ["Real-time streaming output", "Gemini 1.5 Flash powered", "Clean overlay popup"],
  },
  {
    icon: Palette,
    title: "Smart Skeleton Loader",
    bullets: ["Matches theme automatically", "Smooth transitions", "Feels native to webpage"],
  },
  {
    icon: MousePointer,
    title: "Effortless UX",
    bullets: ["Right-click context menu", "Popup language switcher", "Zero friction workflow"],
  },
];

const FeaturesSection = () => (
  <section id="features" className="py-24 relative">
    <div className="absolute inset-0 bg-radial-glow opacity-50" />
    <div className="relative max-w-6xl mx-auto px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <p className="text-sm font-mono text-primary mb-3 tracking-wider uppercase">Features</p>
        <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
          Everything you need to read the web
        </h2>
      </motion.div>

      <div className="grid sm:grid-cols-2 gap-5">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="p-6 rounded-xl bg-card border border-border card-hover"
          >
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <f.icon size={20} className="text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-3">{f.title}</h3>
            <ul className="space-y-2">
              {f.bullets.map((b) => (
                <li key={b} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="w-1 h-1 rounded-full bg-primary mt-2 shrink-0" />
                  {b}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default FeaturesSection;
