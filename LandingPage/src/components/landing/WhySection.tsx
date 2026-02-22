import { motion } from "framer-motion";
import { GraduationCap, Code2, Newspaper, Users } from "lucide-react";

const useCases = [
  { icon: GraduationCap, text: "Students reading research papers in foreign languages" },
  { icon: Code2, text: "Developers reading documentation across languages" },
  { icon: Newspaper, text: "Professionals reading global news and reports" },
  { icon: Users, text: "Non-native speakers browsing any content online" },
];

const WhySection = () => (
  <section className="py-24 bg-card/30">
    <div className="max-w-6xl mx-auto px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16 max-w-2xl mx-auto"
      >
        <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
          The Internet is Global.{" "}
          <span className="text-gradient-green">Language Shouldn't Be a Barrier.</span>
        </h2>
      </motion.div>

      <div className="grid sm:grid-cols-2 gap-5 max-w-3xl mx-auto">
        {useCases.map((uc, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="flex items-start gap-4 p-5 rounded-xl bg-card border border-border card-hover"
          >
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <uc.icon size={18} className="text-primary" />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{uc.text}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default WhySection;
