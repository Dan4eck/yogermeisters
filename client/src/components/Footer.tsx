import { Instagram, Youtube } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-black text-white py-16 border-t border-white/10">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-8">
          
          <div>
            <a href="/" className="text-lg font-bold tracking-tighter flex items-center gap-2 mb-4">
              <div className="w-4 h-4 bg-white rounded-full" />
              <span>Yogermeisters</span>
            </a>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Designed for balance. <br />
              Engineered for peace.
            </p>
          </div>

          <div className="flex gap-6">
            <a href="#" className="text-muted-foreground hover:text-white transition-colors" title="Instagram">
              <Instagram size={24} />
            </a>
            <a href="#" className="text-muted-foreground hover:text-white transition-colors" title="YouTube">
              <Youtube size={24} />
            </a>
          </div>

        </div>

        <div className="border-t border-white/5 pt-8 text-center md:text-left text-xs text-muted-foreground">
          <p>&copy; 2024 Yogermeisters Inc. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
