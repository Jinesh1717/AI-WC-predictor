const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');

// Type definitions
interface ParsedPlayer {
  id: string;
  teamId: string;
  name: string;
  position: string;
  caps: number;
  goals: number;
  height: number;
  dob: string;
  club: string;
  rating: number; // Derived
  isStarPlayer: boolean;
}

interface ParsedTeam {
  id: string;
  name: string;
  coach: string;
  ranking: number;
  flag: string;
  formation: string;
  stats: {
    goalsScored: number;
    goalsConceded: number;
    winRate: number;
    recentForm: number[];
    attack: number;
    defense: number;
    midfield: number;
    experience: number;
    benchStrength: number;
    fitness: number;
  };
}

const getFlagEmoji = (countryCode: string) => {
  if (countryCode === 'ENG') return '🏴󠁧󠁢󠁥󠁮󠁧󠁿';
  if (countryCode === 'SCO') return '🏴󠁧󠁢󠁳󠁣󠁴󠁿';
  if (countryCode === 'WAL') return '🏴󠁧󠁢󠁷󠁬󠁳󠁿';
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};

// We will use standard 2-letter ISO codes for flags from the 3-letter codes provided where possible, 
// or simply use a mapping since there are 48 teams.
const countryToISO: Record<string, string> = {
  'ARG': 'AR', 'FRA': 'FR', 'BRA': 'BR', 'ENG': 'GB-ENG', 'ESP': 'ES', 'POR': 'PT',
  'ALG': 'DZ', 'AUS': 'AU', 'AUT': 'AT', 'BEL': 'BE', 'BIH': 'BA', 'CPV': 'CV',
  'CAN': 'CA', 'COL': 'CO', 'COD': 'CD', 'CIV': 'CI', 'CRO': 'HR', 'CUW': 'CW',
  'CZE': 'CZ', 'ECU': 'EC', 'EGY': 'EG', 'IRN': 'IR', 'IRQ': 'IQ', 'JPN': 'JP',
  'JOR': 'JO', 'KOR': 'KR', 'MEX': 'MX', 'MAR': 'MA', 'NED': 'NL', 'NZL': 'NZ',
  'NOR': 'NO', 'PAN': 'PA', 'PAR': 'PY', 'QAT': 'QA', 'KSA': 'SA', 'SCO': 'GB-SCT',
  'SEN': 'SN', 'RSA': 'ZA', 'SWE': 'SE', 'SUI': 'CH', 'TUN': 'TN', 'TUR': 'TR',
  'URU': 'UY', 'USA': 'US', 'UZB': 'UZ'
};

const parseData = async () => {
  const pdfPath = path.resolve(process.cwd(), '../SquadLists-English.pdf');
  const dataBuffer = fs.readFileSync(pdfPath);
  
  const data = await pdfParse(dataBuffer);
  const text = data.text;
  
  const lines = text.split('\n').map((l: string) => l.trim()).filter((l: string) => l.length > 0);
  
  const teams: ParsedTeam[] = [];
  const players: ParsedPlayer[] = [];
  
  let currentTeamName = '';
  let currentTeamId = '';
  let currentCoach = '';
  let rankingCounter = 1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect Team Header: e.g. "Algeria (ALG)"
    const teamMatch = line.match(/^([A-Za-z\s'üéáíóúçñã]+)\s+\(([A-Z]{3})\)$/);
    if (teamMatch && !line.includes('FIFA')) {
      currentTeamName = teamMatch[1].trim();
      currentTeamId = teamMatch[2].trim();
      
      const isoCode = countryToISO[currentTeamId] || currentTeamId.substring(0,2);
      const flag = isoCode === 'GB-ENG' ? '🏴󠁧󠁢󠁥󠁮󠁧󠁿' : (isoCode === 'GB-SCT' ? '🏴󠁧󠁢󠁳󠁣󠁴󠁿' : getFlagEmoji(isoCode));

      teams.push({
        id: currentTeamId,
        name: currentTeamName,
        coach: 'TBD',
        ranking: rankingCounter++,
        flag: flag,
        formation: '4-3-3',
        stats: {
          goalsScored: Math.floor(Math.random() * 20) + 10,
          goalsConceded: Math.floor(Math.random() * 10) + 2,
          winRate: Math.floor(Math.random() * 40) + 40,
          recentForm: [1, 1, 0, -1, 1],
          attack: 80, defense: 80, midfield: 80, experience: 80, benchStrength: 80, fitness: 80
        }
      });
      continue;
    }

    // Detect Coach: e.g. "Head coach PETKOVIC Vladimir Vladimir PETKOVIĆ Switzerland"
    if (line.startsWith('Head coach')) {
      const parts = line.split(/\s+/);
      if (parts.length >= 4) {
        currentCoach = `${parts[2]} ${parts[3]}`;
        const teamIndex = teams.findIndex(t => t.id === currentTeamId);
        if (teamIndex > -1) {
          teams[teamIndex].coach = currentCoach;
        }
      }
      continue;
    }

    // Detect Player: e.g. "1 GK MASTIL Melvin Melvin Feycal MASTIL MASTIL 19/02/2000 FC Stade Nyonnais (SUI) 194 2 0"
    // Wait, the OCR output from view_file looks like: "GK MASTIL Melvin Melvin Feycal MASTIL MASTIL 19/02/2000 FC Stade Nyonnais (SUI) 194 2 0" (the index number might be missing or separated)
    // Let's use a regex to match the POS, Date, Height, Caps, Goals
    
    // A robust regex: (GK|DF|MF|FW) ... (DD/MM/YYYY) ... (Number) (Number) (Number)
    const posMatch = line.match(/^(GK|DF|MF|FW)\s+(.+?)\s+(\d{2}\/\d{2}\/\d{4})\s+(.+?)\s+(\d{3})\s+(\d+)\s+(\d+)$/);
    if (posMatch) {
      const position = posMatch[1];
      const namePart = posMatch[2];
      const dob = posMatch[3];
      const clubPart = posMatch[4];
      const height = parseInt(posMatch[5], 10);
      const caps = parseInt(posMatch[6], 10);
      const goals = parseInt(posMatch[7], 10);

      // Extract the first two words of namePart as a simplified name
      const nameWords = namePart.split(' ');
      const name = nameWords.length > 1 ? `${nameWords[0]} ${nameWords[1]}` : nameWords[0];

      // Calculate rating based on caps/goals
      const rating = 70 + Math.min(20, caps / 5) + Math.min(9, goals);
      const isStarPlayer = rating > 85;

      players.push({
        id: `p_${currentTeamId}_${players.length}`,
        teamId: currentTeamId,
        name: name,
        position: position,
        caps, goals, height, dob, club: clubPart,
        rating: Math.floor(rating),
        isStarPlayer
      });
    }
  }

  // Post-process Team ratings based on average player ratings
  teams.forEach(team => {
    const teamPlayers = players.filter(p => p.teamId === team.id);
    if (teamPlayers.length > 0) {
      const avgRating = teamPlayers.reduce((sum, p) => sum + p.rating, 0) / teamPlayers.length;
      const attackers = teamPlayers.filter(p => p.position === 'FW');
      const defenders = teamPlayers.filter(p => p.position === 'DF' || p.position === 'GK');
      const midfielders = teamPlayers.filter(p => p.position === 'MF');

      team.stats.attack = Math.floor(attackers.length ? attackers.reduce((s,p)=>s+p.rating,0)/attackers.length : avgRating);
      team.stats.defense = Math.floor(defenders.length ? defenders.reduce((s,p)=>s+p.rating,0)/defenders.length : avgRating);
      team.stats.midfield = Math.floor(midfielders.length ? midfielders.reduce((s,p)=>s+p.rating,0)/midfielders.length : avgRating);
      team.stats.experience = Math.floor(teamPlayers.reduce((sum,p) => sum + Math.min(100, p.caps * 2), 0) / teamPlayers.length);
    }
  });

  fs.writeFileSync(path.join(process.cwd(), 'src/data/realTeams.json'), JSON.stringify(teams, null, 2));
  fs.writeFileSync(path.join(process.cwd(), 'src/data/realPlayers.json'), JSON.stringify(players, null, 2));

  console.log(`Parsed ${teams.length} teams and ${players.length} players.`);
};

parseData().catch(console.error);
