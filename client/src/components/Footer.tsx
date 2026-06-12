import { Link } from 'react-router-dom';
import { Trophy, Activity, Users, Globe } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="relative border-t border-white/5 pt-20 pb-8 px-6 mt-20 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-60 scale-110"
          style={{ backgroundImage: 'url(/assets/hero-bg.jpg)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-dark via-bg-dark/90 to-transparent" />
        
        {/* Subtle Glassy Touch (Sheen without blurring the image) */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent mix-blend-overlay pointer-events-none" />
        {/* Floating Lights */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px] mix-blend-screen" />
      </div>

      <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12 relative z-10">
        <div className="col-span-1 md:col-span-2">
          <Link to="/" className="flex items-center gap-2 text-white font-bold text-2xl tracking-tight mb-4">
            <Trophy className="text-primary" />
            <span>AI WC Predictor <span className="text-gray-500 font-normal">2026</span></span>
          </Link>
          <p className="text-gray-400 max-w-sm">
            The most advanced AI-powered football prediction platform for the 2026 FIFA World Cup.
          </p>
        </div>
        
        <div>
          <h4 className="text-white font-semibold mb-4">Explore</h4>
          <ul className="space-y-2 text-gray-400 text-sm">
            <li><Link to="/predict" className="hover:text-primary transition-colors">AI Predictor</Link></li>
            <li><Link to="/teams" className="hover:text-primary transition-colors">Teams & Stats</Link></li>
            <li><Link to="/bracket" className="hover:text-primary transition-colors">Tournament Bracket</Link></li>
            <li><Link to="/comparison" className="hover:text-primary transition-colors">Team Comparison</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4">Connect</h4>
          <div className="flex items-center gap-4 text-gray-400">
            <a href="#" className="hover:text-white transition-colors"><Activity size={20} /></a>
            <a href="#" className="hover:text-white transition-colors"><Users size={20} /></a>
            <a href="#" className="hover:text-white transition-colors"><Globe size={20} /></a>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between text-sm text-gray-500">
        <p>&copy; 2026 AI WC Predictor. All rights reserved.</p>
        <div className="flex gap-4 mt-4 md:mt-0">
          <a href="#" className="hover:text-gray-300">Privacy Policy</a>
          <a href="#" className="hover:text-gray-300">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
