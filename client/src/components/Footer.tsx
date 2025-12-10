import { Instagram, Facebook, Mail, MapPin, Github, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-black text-white py-16 border-t border-white/10">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          <div className="col-span-1">
            <a href="/" className="text-lg font-bold tracking-tighter flex items-center gap-2 mb-6">
              <div className="w-4 h-4 bg-white rounded-full" />
              <span>Yogermeisters</span>
            </a>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Designed for balance. <br />
              Engineered for peace.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-sm mb-6 text-white/90">Product</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-white transition-colors">Retreats</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Classes</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Workshops</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-sm mb-6 text-white/90">Company</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-white transition-colors">About</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Methodology</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-sm mb-6 text-white/90">Legal</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
            </ul>
            
            <div className="flex gap-4 mt-8">
               <a href="#" className="text-muted-foreground hover:text-white transition-colors"><Twitter size={18} /></a>
               <a href="#" className="text-muted-foreground hover:text-white transition-colors"><Instagram size={18} /></a>
               <a href="#" className="text-muted-foreground hover:text-white transition-colors"><Github size={18} /></a>
            </div>
          </div>

        </div>

        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-muted-foreground">
          <p>&copy; 2024 Yogermeisters Inc. All rights reserved.</p>
          <div className="flex items-center gap-2 mt-4 md:mt-0">
             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
             <span>Systems Operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
