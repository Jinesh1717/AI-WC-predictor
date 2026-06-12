const fs = require('fs');
const path = require('path');
const PDFParser = require('pdf2json');

const countryToISO = {
  'ARG': 'AR', 'FRA': 'FR', 'BRA': 'BR', 'ENG': 'GB-ENG', 'ESP': 'ES', 'POR': 'PT',
  'ALG': 'DZ', 'AUS': 'AU', 'AUT': 'AT', 'BEL': 'BE', 'BIH': 'BA', 'CPV': 'CV',
  'CAN': 'CA', 'COL': 'CO', 'COD': 'CD', 'CIV': 'CI', 'CRO': 'HR', 'CUW': 'CW',
  'CZE': 'CZ', 'ECU': 'EC', 'EGY': 'EG', 'IRN': 'IR', 'IRQ': 'IQ', 'JPN': 'JP',
  'JOR': 'JO', 'KOR': 'KR', 'MEX': 'MX', 'MAR': 'MA', 'NED': 'NL', 'NZL': 'NZ',
  'NOR': 'NO', 'PAN': 'PA', 'PAR': 'PY', 'QAT': 'QA', 'KSA': 'SA', 'SCO': 'GB-SCT',
  'SEN': 'SN', 'RSA': 'ZA', 'SWE': 'SE', 'SUI': 'CH', 'TUN': 'TN', 'TUR': 'TR',
  'URU': 'UY', 'USA': 'US', 'UZB': 'UZ'
};

const getFlagEmoji = (countryCode) => {
  if (countryCode === 'ENG') return '🏴󠁧󠁢󠁥󠁮󠁧󠁿';
  if (countryCode === 'SCO') return '🏴󠁧󠁢󠁳󠁣󠁴󠁿';
  if (countryCode === 'WAL') return '🏴󠁧󠁢󠁷󠁬󠁳󠁿';
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};

const pdfParser = new PDFParser();

pdfParser.on("pdfParser_dataError", errData => console.error(errData.parserError));
pdfParser.on("pdfParser_dataReady", pdfData => {
  const teams = [];
  const players = [];
  let rankingCounter = 1;

  pdfData.formImage.Pages.forEach((page, pageIndex) => {
    // Process each page
    // Text elements
    const texts = page.Texts.map(t => ({
      x: t.x,
      y: t.y,
      text: decodeURIComponent(t.R[0].T)
    }));

    // Group texts by Y coordinate (rows)
    const rows = {};
    texts.forEach(t => {
      // Round y to 1 decimal place to group items on same line
      const rowY = Math.round(t.y * 10) / 10;
      if (!rows[rowY]) rows[rowY] = [];
      rows[rowY].push(t);
    });

    // Sort rows by Y
    const sortedY = Object.keys(rows).map(Number).sort((a, b) => a - b);
    
    let currentTeamId = null;
    let currentTeamName = null;

    sortedY.forEach(y => {
      // Sort items in the row by X
      const rowItems = rows[y].sort((a, b) => a.x - b.x);
      const rowText = rowItems.map(t => t.text).join(' ').trim();

      // Check if team name row
      // Format usually: "Algeria (ALG)"
      const teamMatch = rowText.match(/^([A-Za-z\s'üéáíóúçñã]+)\s+\(([A-Z]{3})\)$/);
      if (teamMatch && !rowText.includes('FIFA')) {
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
      }

      // Check if coach row
      if (rowText.includes('Head coach')) {
        const parts = rowText.split(/\s+/);
        if (parts.length >= 4) {
          const coach = `${parts[2]} ${parts[3]}`;
          const tIdx = teams.findIndex(t => t.id === currentTeamId);
          if (tIdx > -1) {
            teams[tIdx].coach = coach;
          }
        }
      }

      // Check if player row
      // We expect POS to be one of the items. E.g. [1, GK, MASTIL Melvin, ...]
      // Since rowItems are sorted by x, we can check their text.
      // Usually index 0 is number, index 1 is POS. Or index 0 is POS if no number.
      let posIndex = rowItems.findIndex(t => ['GK', 'DF', 'MF', 'FW'].includes(t.text));
      
      if (posIndex > -1 && rowItems.length >= 8) {
        const position = rowItems[posIndex].text;
        
        // Club is usually index before height
        // The last 3 are Height, Caps, Goals
        const len = rowItems.length;
        const height = parseInt(rowItems[len - 3].text, 10);
        const caps = parseInt(rowItems[len - 2].text, 10);
        const goals = parseInt(rowItems[len - 1].text, 10);

        if (!isNaN(height) && !isNaN(caps) && !isNaN(goals)) {
          // The name is somewhere after POS. Let's just grab the text right after POS as short name
          const nameFull = rowItems[posIndex + 1].text;
          const nameWords = nameFull.split(' ');
          const name = nameWords.length > 1 ? `${nameWords[0]} ${nameWords[1]}` : nameWords[0];
          
          const rating = 70 + Math.min(20, caps / 5) + Math.min(9, goals);
          const isStarPlayer = rating > 85;

          players.push({
            id: `p_${currentTeamId}_${players.length}`,
            teamId: currentTeamId,
            name: name,
            position: position,
            caps, goals, height, dob: '2000-01-01', club: 'Unknown',
            rating: Math.floor(rating),
            isStarPlayer
          });
        }
      }
    });
  });

  // Post-process Team ratings
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

  console.log(`Parsed ${teams.length} teams and ${players.length} players using pdf2json.`);
});

const pdfPath = path.resolve(process.cwd(), '../SquadLists-English.pdf');
pdfParser.loadPDF(pdfPath);
