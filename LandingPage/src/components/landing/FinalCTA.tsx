import { motion } from "framer-motion";

const FinalCTA = () => (
  <section className="py-32 relative">
    <div className="absolute inset-0 bg-radial-glow" />
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px]" />
    
    <div className="relative max-w-6xl mx-auto px-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-foreground mb-6 tracking-tight">
          Understand Any Page.{" "}
          <span className="text-gradient-green">Instantly.</span>
        </h2>
        <p className="text-lg text-muted-foreground mb-10 max-w-md mx-auto">
          Join thousands of users who read the web without language barriers.
        </p>
        <a
          href="https://github.com/Hemantcods/LingoBridge"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-8 py-4 font-semibold bg-primary text-primary-foreground rounded-lg hover:brightness-110 transition-all glow-green-strong text-sm"
        >
          Add to Chrome — It's Free
        </a>
      </motion.div>
    </div>
  </section>
);

export default FinalCTA;
