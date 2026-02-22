import { motion } from "framer-motion";

const stack = [
  { label: "Frontend", value: "React + Vite", color: "text-primary" },
  { label: "Platform", value: "Chrome Extension (Manifest V3)", color: "text-foreground" },
  { label: "Translation", value: "Lingo.dev SDK", color: "text-primary" },
  { label: "AI Engine", value: "Gemini 1.5 Flash", color: "text-foreground" },
];

const TechSection = () => (
  <section id="tech" className="py-24 relative">
    <div className="max-w-6xl mx-auto px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <p className="text-sm font-mono text-primary mb-3 tracking-wider uppercase">Architecture</p>
        <h2 className="text-3xl sm:text-4xl font-bold text-foreground">Built on modern foundations</h2>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-xl mx-auto bg-card border border-border rounded-xl overflow-hidden font-mono text-sm"
      >
        {stack.map((item, i) => (
          <div
            key={item.label}
            className={`flex items-center justify-between px-6 py-4 ${
              i < stack.length - 1 ? "border-b border-border" : ""
            }`}
          >
            <span className="text-muted-foreground">{item.label}</span>
            <span className={item.color}>{item.value}</span>
          </div>
        ))}
      </motion.div>
    </div>
  </section>
);

export default TechSection;
