import { Instagram, Youtube } from 'lucide-react';

export default function Footer() {

  return (
    <footer id='contact' className="bg-black text-white py-16 border-t border-white/10">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          
          <div>
            <a href="/" className="text-lg font-bold tracking-tighter flex items-center gap-2">
              <div className="w-4 h-4 bg-white rounded-full" />
              <span>Yogermeisters</span>
            </a>
          </div>

          <div className="flex gap-6">
            <a href="https://www.instagram.com/an_rolla?igsh=MXh1eGFlcXlzNHhpOA==" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-white transition-colors" title="Instagram">
              <Instagram size={24} />
            </a>
            <a href="https://www.youtube.com/@AnastasiaPagliacci" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-white transition-colors" title="YouTube">
              <Youtube size={24} />
            </a>
          </div>

        </div>
      </div>
    </footer>
  );
}
