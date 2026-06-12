import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion, useScroll, useTransform } from 'framer-motion';

const MainLayout = () => {
  const { scrollYProgress } = useScroll();
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);

  return (
    <div className="relative min-h-screen bg-bg-dark text-white overflow-hidden">
      {/* Global Background Elements with Image Collage */}
      <motion.div 
        style={{ y: backgroundY }}
        className="fixed inset-0 z-0 pointer-events-none"
      >
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-60 scale-105"
          style={{ backgroundImage: 'url(/assets/hero-bg.jpg)' }}
        />
        {/* Gradient Mask for fading into dark theme */}
        <div className="absolute inset-0 bg-gradient-to-b from-bg-dark/40 via-bg-dark/80 to-bg-dark" />
        
        {/* Subtle Glassy Touch (Sheen without blurring the image) */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent mix-blend-overlay pointer-events-none" />
        
        {/* Abstract Floating Circles */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-secondary/10 blur-[150px]" />
      </motion.div>
      
      <Navbar />
      
      <main className="relative z-10 w-full">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

export default MainLayout;
