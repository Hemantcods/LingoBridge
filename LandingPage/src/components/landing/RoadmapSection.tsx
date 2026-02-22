import { motion } from "framer-motion";
import { Search, History, FileText, Volume2, Smartphone } from "lucide-react";

const items = [
  { icon: Search, title: "Auto Language Detection", status: "Planned" },
  { icon: History, title: "Translation History", status: "Planned" },
  { icon: FileText, title: "PDF Support", status: "Planned" },
  { icon: Volume2, title: "Voice Playback", status: "Exploring" },
  { icon: Smartphone, title: "Mobile Support", status: "Exploring" },
];

const RoadmapSection = () => (
  <section id="roadmap" className="py-24">
    <div className="max-w-6xl mx-auto px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <p className="text-sm font-mono text-primary mb-3 tracking-wider uppercase">Roadmap</p>
        <h2 className="text-3xl sm:text-4xl font-bold text-foreground">What's coming next</h2>
      </motion.div>

      <div className="max-w-xl mx-auto space-y-3">
        {items.map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border card-hover"
          >
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <item.icon size={18} className="text-primary" />
            </div>
            <span className="text-sm text-foreground flex-1">{item.title}</span>
            <span className="text-xs font-mono text-muted-foreground px-2 py-1 rounded-md bg-secondary">
              {item.status}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default RoadmapSection;
