import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, ChevronDown, CheckCircle2 } from 'lucide-react';
import api from '../services/api';

export const PredictorSimulator = () => {
  const [teams, setTeams] = useState<any[]>([]);
  const [teamA, setTeamA] = useState<string>('');
  const [teamB, setTeamB] = useState<string>('');
  const [prediction, setPrediction] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/teams').then(res => {
      setTeams(res.data);
      if (res.data.length >= 2) {
        setTeamA(res.data[0].id);
        setTeamB(res.data[1].id);
      }
    }).catch(console.error);
  }, []);

  const handlePredict = async () => {
    if (!teamA || !teamB || teamA === teamB) return;
    
    setLoading(true);
    setPrediction(null);
    
    try {
      // Simulate network delay for effect
      await new Promise(r => setTimeout(r, 1500));
      const res = await api.post('/predict', { teamAId: teamA, teamBId: teamB });
      setPrediction(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getTeamInfo = (id: string) => teams.find(t => t.id === id);

  return (
    <section className="py-32 relative z-10 overflow-hidden" id="simulator">
      {/* Background Image and Particles */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-70 scale-110"
          style={{ backgroundImage: 'url(/assets/hero-bg.jpg)' }}
        />
        <div className="absolute inset-0 bg-black/60" />
        
        {/* Subtle Glassy Touch (Sheen without blurring the image) */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent mix-blend-overlay pointer-events-none" />
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-accent/20 rounded-full blur-[120px] mix-blend-screen" />
      </div>

      <div className="container mx-auto px-6 max-w-5xl relative z-10">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center justify-center p-3 glass rounded-full mb-6"
          >
            <BrainCircuit className="text-primary w-8 h-8" />
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-black tracking-tight mb-4"
          >
            Prediction Simulator
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto"
          >
            Select two teams and let our AI engine run thousands of permutations based on historical data to predict the outcome.
          </motion.p>
        </div>

        <div className="glass-card p-8 md:p-12">
          {/* Selectors */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
            <div className="w-full relative">
              <label className="block text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wider">Team A</label>
              <div className="relative">
                <select 
                  value={teamA} 
                  onChange={(e) => setTeamA(e.target.value)}
                  className="w-full appearance-none bg-black/50 border border-white/10 rounded-xl px-6 py-4 text-xl font-bold focus:outline-none focus:border-primary/50 transition-colors"
                >
                  {teams.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="flex-shrink-0 font-black text-2xl text-gray-600">VS</div>

            <div className="w-full relative">
              <label className="block text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wider">Team B</label>
              <div className="relative">
                <select 
                  value={teamB} 
                  onChange={(e) => setTeamB(e.target.value)}
                  className="w-full appearance-none bg-black/50 border border-white/10 rounded-xl px-6 py-4 text-xl font-bold focus:outline-none focus:border-secondary/50 transition-colors"
                >
                  {teams.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="flex justify-center mb-12">
            <button 
              onClick={handlePredict}
              disabled={loading || teamA === teamB}
              className="glow-button px-12 py-4 text-lg w-full md:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Analyzing Data...' : 'Run Prediction'}
            </button>
          </div>

          {/* Results Area */}
          <AnimatePresence mode="wait">
            {prediction && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="border-t border-white/10 pt-12 overflow-hidden"
              >
                <div className="flex flex-col items-center mb-8">
                  <div className="text-sm font-semibold text-accent mb-2 tracking-widest uppercase">AI Prediction Result</div>
                  <h3 className="text-3xl md:text-5xl font-black text-center">
                    {prediction.prediction.winnerId === prediction.teamA.id ? prediction.teamA.name : (prediction.prediction.winnerId === prediction.teamB.id ? prediction.teamB.name : 'Draw')}
                  </h3>
                  <div className="flex items-center gap-2 mt-2 text-gray-400">
                    <CheckCircle2 size={16} className="text-green-400" />
                    <span>{prediction.prediction.confidence}% Confidence</span>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-8">
                  {/* Team A Stats */}
                  <div className="w-full md:w-5/12 text-center md:text-left">
                    <div className="font-bold text-2xl mb-1">{prediction.teamA.name}</div>
                    <div className="text-primary font-mono text-3xl font-light">{prediction.teamA.probability}%</div>
                  </div>

                  {/* Probability Bar */}
                  <div className="w-full md:w-2/12 flex flex-col items-center">
                    <div className="h-32 w-4 bg-white/5 rounded-full overflow-hidden flex flex-col justify-end relative">
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: `${prediction.teamB.probability}%` }}
                        className="w-full bg-secondary absolute top-0"
                      />
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: `${prediction.teamA.probability}%` }}
                        className="w-full bg-primary absolute bottom-0"
                      />
                    </div>
                  </div>

                  {/* Team B Stats */}
                  <div className="w-full md:w-5/12 text-center md:text-right">
                    <div className="font-bold text-2xl mb-1">{prediction.teamB.name}</div>
                    <div className="text-secondary font-mono text-3xl font-light">{prediction.teamB.probability}%</div>
                  </div>
                </div>

                <div className="bg-white/5 rounded-xl p-6 border border-white/5">
                  <h4 className="font-semibold text-white mb-2">AI Analysis</h4>
                  <p className="text-gray-400 leading-relaxed">
                    {prediction.prediction.explanation} The AI factored in historical form, head-to-head records, and current FIFA rankings to generate this outcome.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default PredictorSimulator;
