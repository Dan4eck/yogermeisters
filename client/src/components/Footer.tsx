import { Instagram, Facebook, Mail, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-foreground text-background py-16">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          <div className="col-span-1 md:col-span-1">
            <a href="/" className="text-2xl font-serif font-bold tracking-tight mb-6 block">
              Serenity Flow
            </a>
            <p className="text-background/60 font-light text-sm leading-relaxed">
              Guiding you towards balance, strength, and inner peace through the practice of yoga and mindful living.
            </p>
          </div>

          <div>
            <h4 className="font-serif text-lg mb-6">Explore</h4>
            <ul className="space-y-4 text-sm text-background/60">
              <li><a href="#about" className="hover:text-white transition-colors">About</a></li>
              <li><a href="#tours" className="hover:text-white transition-colors">Retreats</a></li>
              <li><a href="#reviews" className="hover:text-white transition-colors">Testimonials</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-lg mb-6">Contact</h4>
            <ul className="space-y-4 text-sm text-background/60">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4" /> hello@serenityflow.com
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4" /> 123 Yoga Lane, Wellness City
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-lg mb-6">Newsletter</h4>
            <p className="text-background/60 text-sm mb-4">
              Subscribe for wellness tips and retreat updates.
            </p>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="Your email" 
                className="bg-white/10 border-none rounded-md px-4 py-2 text-sm w-full focus:ring-1 focus:ring-primary"
              />
              <button className="bg-primary text-white px-4 py-2 rounded-md text-sm hover:bg-primary/90">
                Join
              </button>
            </div>
            <div className="flex gap-4 mt-8">
              <a href="#" className="text-background/60 hover:text-white transition-colors"><Instagram className="w-5 h-5" /></a>
              <a href="#" className="text-background/60 hover:text-white transition-colors"><Facebook className="w-5 h-5" /></a>
            </div>
          </div>

        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-background/40">
          <p>&copy; 2024 Serenity Flow. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
