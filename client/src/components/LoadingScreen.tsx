import { motion } from 'framer-motion';

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 bg-bg-dark flex items-center justify-center z-50">
      <div className="relative flex flex-col items-center">
        {/* Animated Trophy Silhouette / Glowing Orb */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="w-32 h-32 rounded-full bg-primary/20 blur-xl absolute"
        />
        
        {/* Spinning Outer Ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="w-24 h-24 rounded-full border-2 border-transparent border-t-primary border-r-secondary absolute"
        />
        
        {/* Inner static ball/icon */}
        <div className="w-16 h-16 rounded-full bg-black border border-white/10 flex items-center justify-center relative z-10 overflow-hidden">
          <div className="text-primary font-black text-2xl">WC</div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <div className="text-white font-black tracking-widest uppercase mb-2">Loading Environment</div>
          <div className="text-primary font-mono text-sm">Calibrating Predictor Engine...</div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoadingScreen;
