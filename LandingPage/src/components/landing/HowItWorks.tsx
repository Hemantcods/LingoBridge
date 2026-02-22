import { motion } from "framer-motion";
import { MousePointer2, Menu, Sparkles } from "lucide-react";

const steps = [
  {
    icon: MousePointer2,
    step: "01",
    title: "Select Text",
    desc: "Highlight any text on any webpage in any language.",
  },
  {
    icon: Menu,
    step: "02",
    title: "Right Click → Translate or Summarize",
    desc: "Choose your action from the context menu. Pick your target language.",
  },
  {
    icon: Sparkles,
    step: "03",
    title: "Instantly View Results",
    desc: "See translations in-place or AI summaries in a clean overlay — instantly.",
  },
];

const HowItWorks = () => (
  <section id="how-it-works" className="py-24 bg-card/30">
    <div className="max-w-6xl mx-auto px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <p className="text-sm font-mono text-primary mb-3 tracking-wider uppercase">How It Works</p>
        <h2 className="text-3xl sm:text-4xl font-bold text-foreground">Three steps. Zero friction.</h2>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-8">
        {steps.map((s, i) => (
          <motion.div
            key={s.step}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15 }}
            className="text-center"
          >
            <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-5">
              <s.icon size={24} className="text-primary" />
            </div>
            <div className="text-xs font-mono text-primary mb-2">{s.step}</div>
            <h3 className="text-lg font-semibold text-foreground mb-2">{s.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default HowItWorks;
