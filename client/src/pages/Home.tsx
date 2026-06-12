import { motion, useScroll, useTransform } from 'framer-motion';
import { Trophy, Activity, Users, Globe2, Brain, ChevronRight } from 'lucide-react';
import Scene from '../components/3d/Scene';
import { PredictorSimulator } from '../components/PredictorSimulator';
import { useRef } from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  // Animations as user scrolls
  const trophyScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.5]);
  const trophyY = useTransform(scrollYProgress, [0, 0.5], ['0%', '-30%']);
  const trophyOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);

  const textY = useTransform(scrollYProgress, [0, 0.3], ['0%', '50%']);
  const textOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  return (
    <div ref={containerRef} className="flex flex-col w-full relative">
      {/* Hero Section */}
      <section className="relative w-full h-screen flex flex-col items-center justify-center overflow-hidden perspective-1000">
        
        {/* 3D Background / Rotating Trophy */}
        <motion.div 
          style={{ scale: trophyScale, y: trophyY, opacity: trophyOpacity }}
          className="absolute inset-0 z-0 flex items-center justify-center"
        >
          <div className="w-full h-full max-w-[800px] max-h-[800px]">
            <Scene />
          </div>
        </motion.div>

        <motion.div 
          style={{ y: textY, opacity: textOpacity }}
          className="relative z-10 container mx-auto px-6 flex flex-col items-center text-center mt-20"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className="mb-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass border border-primary/30 text-primary text-sm font-semibold tracking-wide shadow-[0_0_20px_rgba(10,132,255,0.2)]"
          >
            <Brain size={18} />
            <span className="uppercase tracking-widest">AI Prediction Engine</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
            className="text-6xl md:text-8xl lg:text-[8rem] font-black mb-6 tracking-tighter leading-[0.9]"
          >
            WHO WILL WIN <br className="hidden md:block" />
            <span className="text-gradient">FIFA 2026?</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, filter: 'blur(5px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.6 }}
            className="text-xl md:text-2xl text-gray-300 max-w-3xl mb-12 font-light"
          >
            Experience the future of football analytics. Our neural network analyzes millions of data points to predict the next World Champion.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.8 }}
            className="flex flex-col sm:flex-row items-center gap-6 mt-12 relative z-20"
          >
            <button 
              onClick={() => document.getElementById('simulator')?.scrollIntoView({ behavior: 'smooth' })}
              className="glow-button px-8 py-4 text-lg w-full sm:w-auto"
            >
              Predict a Match
            </button>
            <Link 
              to="/teams"
              className="glass border border-white/10 px-8 py-4 text-lg text-white hover:bg-white/5 transition-colors text-center w-full sm:w-auto"
            >
              Explore Teams
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-32 relative z-10 border-t border-white/5 bg-black/40 backdrop-blur-2xl">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: 'Teams Analyzed', value: '48', icon: Users },
              { label: 'Historical Matches', value: '2.5k+', icon: Activity },
              { label: 'AI Parameters', value: '1.2M', icon: Brain },
              { label: 'Countries', value: '32+', icon: Globe2 },
            ].map((stat, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col items-center justify-center p-8 glass-card group cursor-pointer"
              >
                <stat.icon className="text-primary mb-6 group-hover:scale-110 group-hover:text-accent transition-transform duration-500" size={40} />
                <h3 className="text-5xl font-black text-white mb-3 tracking-tighter">{stat.value}</h3>
                <p className="text-gray-400 text-sm uppercase tracking-[0.2em] font-semibold">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Simulator Section */}
      <PredictorSimulator />
    </div>
  );
};

export default Home;
