import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, TrendingUp, Crosshair, Users, Activity } from 'lucide-react';
import api from '../services/api';

const Teams = () => {
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/teams')
      .then(res => {
        setTeams(res.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24">
        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-24 relative z-10">
      <div className="container mx-auto px-6 max-w-7xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-4 text-white">
            Tournament <span className="text-gradient">Teams</span>
          </h1>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto">
            Comprehensive AI analysis and statistics for all qualified nations.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {teams.map((team, i) => (
            <motion.div
              key={team.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="glass-card p-8 group relative overflow-hidden flex flex-col h-full"
            >
              {/* Blurred Decorative Background behind each card content */}
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-10 group-hover:opacity-30 group-hover:scale-110 transition-all duration-700 blur-md pointer-events-none"
                style={{ backgroundImage: 'url(/assets/hero-bg.jpg)' }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-bg-dark/80 via-transparent to-transparent pointer-events-none" />

              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div>
                      <h2 className="text-3xl font-black text-white">{team.name}</h2>
                      <div className="text-primary font-bold text-sm tracking-widest uppercase">
                        Rank #{team.ranking}
                      </div>
                    </div>
                  </div>
                  <Shield className="text-white/20 group-hover:text-primary transition-colors" size={32} />
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-black/40 border border-white/5 p-4 rounded-xl">
                    <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                      <Crosshair size={14} /> Goals
                    </div>
                    <div className="text-2xl font-bold text-white">{team.stats.goalsScored}</div>
                  </div>
                  <div className="bg-black/40 border border-white/5 p-4 rounded-xl">
                    <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                      <TrendingUp size={14} /> Win Rate
                    </div>
                    <div className="text-2xl font-bold text-white">{team.stats.winRate}%</div>
                  </div>
                </div>

                <div className="mt-auto pt-6 border-t border-white/10 flex justify-between items-center">
                  <div className="text-sm text-gray-400 flex items-center gap-2">
                    <Users size={16} /> {team.coach}
                  </div>
                  <button className="text-sm font-bold text-white hover:text-primary transition-colors flex items-center gap-1">
                    <Activity size={16} /> View AI Stats
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Teams;
