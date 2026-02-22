const Footer = () => (
  <footer className="border-t border-border py-8">
    <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
      <span className="text-sm text-muted-foreground">
        © 2025 Lingo<span className="text-primary">Bridge</span>. All rights reserved.
      </span>
      <div className="flex gap-6">
        <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy</a>
        <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Terms</a>
        <a href="https://github.com/Hemantcods" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground transition-colors">GitHub</a>
      </div>
    </div>
  </footer>
);

export default Footer;
