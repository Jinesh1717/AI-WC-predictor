import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <>
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? 'bg-bg-dark/80 backdrop-blur-xl border-b border-white/10 py-4' : 'bg-transparent py-6'
        }`}
      >
        <div className="container mx-auto px-6 max-w-7xl flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <Trophy className="text-primary group-hover:scale-110 transition-transform" size={28} />
            <span className="text-2xl font-black tracking-tighter text-white">
              AI<span className="text-primary">.PREDICTOR</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 font-medium">
            <Link to="/" className="text-white hover:text-primary transition-colors">Home</Link>
            <Link to="/teams" className="text-gray-300 hover:text-white transition-colors">Teams</Link>
            <Link to="/bracket" className="text-gray-300 hover:text-white transition-colors">Tournament Bracket</Link>
          </nav>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden text-white hover:text-primary transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </motion.header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-bg-dark/95 backdrop-blur-3xl pt-24 px-6 flex flex-col gap-6 md:hidden"
          >
            <Link to="/" className="text-3xl font-black text-white hover:text-primary transition-colors py-4 border-b border-white/10">Home</Link>
            <Link to="/teams" className="text-3xl font-black text-white hover:text-primary transition-colors py-4 border-b border-white/10">Teams</Link>
            <Link to="/bracket" className="text-3xl font-black text-white hover:text-primary transition-colors py-4 border-b border-white/10">Bracket</Link>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
