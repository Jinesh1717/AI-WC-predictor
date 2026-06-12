import { motion } from 'framer-motion';

const Bracket = () => {
  // Mock data for quarterfinals to finals
  const matches = {
    quarters: [
      { id: 1, teamA: { name: 'Argentina', flag: '🇦🇷', score: 2 }, teamB: { name: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', score: 1 }, winner: 'A' },
      { id: 2, teamA: { name: 'Spain', flag: '🇪🇸', score: 1 }, teamB: { name: 'Brazil', flag: '🇧🇷', score: 3 }, winner: 'B' },
      { id: 3, teamA: { name: 'France', flag: '🇫🇷', score: 2 }, teamB: { name: 'Portugal', flag: '🇵🇹', score: 0 }, winner: 'A' },
      { id: 4, teamA: { name: 'Germany', flag: '🇩🇪', score: 1 }, teamB: { name: 'Italy', flag: '🇮🇹', score: 0 }, winner: 'A' }
    ],
    semis: [
      { id: 5, teamA: { name: 'Argentina', flag: '🇦🇷', score: 2 }, teamB: { name: 'Brazil', flag: '🇧🇷', score: 1 }, winner: 'A' },
      { id: 6, teamA: { name: 'France', flag: '🇫🇷', score: 3 }, teamB: { name: 'Germany', flag: '🇩🇪', score: 1 }, winner: 'A' }
    ],
    final: [
      { id: 7, teamA: { name: 'Argentina', flag: '🇦🇷', score: '?' }, teamB: { name: 'France', flag: '🇫🇷', score: '?' }, winner: null }
    ]
  };

  const MatchCard = ({ match, delay = 0 }: { match: any, delay?: number }) => (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.5 }}
      className="glass-card w-64 flex flex-col overflow-hidden relative group hover:border-primary/50 transition-colors z-10"
    >
      <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className={`flex justify-between items-center p-3 border-b border-white/5 ${match.winner === 'A' ? 'bg-primary/10' : ''}`}>
        <div className="flex items-center gap-2">
          <span>{match.teamA.flag}</span>
          <span className={`font-semibold ${match.winner === 'A' ? 'text-white' : 'text-gray-400'}`}>{match.teamA.name}</span>
        </div>
        <span className="font-mono text-lg font-bold">{match.teamA.score}</span>
      </div>
      <div className={`flex justify-between items-center p-3 ${match.winner === 'B' ? 'bg-primary/10' : ''}`}>
        <div className="flex items-center gap-2">
          <span>{match.teamB.flag}</span>
          <span className={`font-semibold ${match.winner === 'B' ? 'text-white' : 'text-gray-400'}`}>{match.teamB.name}</span>
        </div>
        <span className="font-mono text-lg font-bold">{match.teamB.score}</span>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen pt-32 pb-24 relative overflow-hidden">
      {/* Background with Oversized Faint Trophy */}
      <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center">
        <motion.div 
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="w-[80vw] h-[80vw] max-w-[1200px] max-h-[1200px] bg-cover bg-center rounded-full opacity-10 blur-[60px]"
          style={{ backgroundImage: 'url(/assets/hero-bg.jpg)' }}
        />
      </div>

      <div className="container mx-auto px-6 relative z-10 overflow-x-auto">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-4 text-white">
            AI <span className="text-gradient">Bracket</span>
          </h1>
          <p className="text-gray-400 text-lg md:text-xl">
            Simulated knockout stages based on optimal AI pathways.
          </p>
        </div>

        <div className="flex justify-between min-w-[1000px] pb-12 px-8">
          {/* Quarter Finals */}
          <div className="flex flex-col justify-around h-[600px]">
            <h3 className="text-accent font-bold tracking-widest uppercase mb-4 text-center">Quarter-Finals</h3>
            {matches.quarters.map((m, i) => <MatchCard key={m.id} match={m} delay={i * 0.1} />)}
          </div>

          {/* Connectors (CSS lines omitted for brevity, using simple gaps) */}
          <div className="w-16"></div>

          {/* Semi Finals */}
          <div className="flex flex-col justify-around h-[600px] py-[75px]">
            <h3 className="text-accent font-bold tracking-widest uppercase mb-4 text-center">Semi-Finals</h3>
            {matches.semis.map((m, i) => <MatchCard key={m.id} match={m} delay={0.4 + (i * 0.1)} />)}
          </div>

          <div className="w-16"></div>

          {/* Final */}
          <div className="flex flex-col justify-center h-[600px]">
            <h3 className="text-primary font-bold tracking-widest uppercase mb-4 text-center text-xl">World Cup Final</h3>
            <div className="relative">
              <div className="absolute -inset-4 bg-primary/20 blur-xl rounded-full" />
              <MatchCard match={matches.final[0]} delay={0.8} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Bracket;
