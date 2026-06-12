import { Request, Response } from 'express';
import Team from '../models/Team';
import Player from '../models/Player';
import HistoricalMatch from '../models/HistoricalMatch';

const calculateFormScore = (form: number[]) => {
  if (!form || form.length === 0) return 0.5;
  const recentForm = form.slice(-5);
  return recentForm.reduce((a, b) => a + b, 0) / (recentForm.length * 3);
};

export const predictMatch = async (req: Request, res: Response): Promise<void> => {
  try {
    const { teamAId, teamBId } = req.body;

    if (!teamAId || !teamBId) {
      res.status(400).json({ message: 'Both teamAId and teamBId are required' });
      return;
    }

    const teamA = await Team.findOne({ id: teamAId });
    const teamB = await Team.findOne({ id: teamBId });

    if (!teamA || !teamB) {
      res.status(404).json({ message: 'One or both teams not found' });
      return;
    }

    // Weights
    // FIFA Ranking = 30% (inverted since lower is better, handled by mapping)
    const teamAForm = calculateFormScore(teamA.stats.recentForm);
    const teamBForm = calculateFormScore(teamB.stats.recentForm);

    // Fetch Kaggle Head-to-Head Data
    const h2hMatches = await HistoricalMatch.find({
      $or: [
        { home_team: teamA.name, away_team: teamB.name },
        { home_team: teamB.name, away_team: teamA.name }
      ]
    });

    let teamAH2HWins = 0;
    let teamBH2HWins = 0;

    h2hMatches.forEach((match: any) => {
      if (match.home_team === teamA.name && match.home_score > match.away_score) teamAH2HWins++;
      if (match.away_team === teamA.name && match.away_score > match.home_score) teamAH2HWins++;
      
      if (match.home_team === teamB.name && match.home_score > match.away_score) teamBH2HWins++;
      if (match.away_team === teamB.name && match.away_score > match.home_score) teamBH2HWins++;
    });

    let teamAH2HBonus = 0;
    let teamBH2HBonus = 0;

    if (h2hMatches.length > 0) {
      const h2hWinRateA = teamAH2HWins / h2hMatches.length;
      const h2hWinRateB = teamBH2HWins / h2hMatches.length;
      teamAH2HBonus = h2hWinRateA * 0.10; // Max 10% bonus for dominating H2H
      teamBH2HBonus = h2hWinRateB * 0.10;
    }

    // Fetch full squads, filtering out injured players if advanced stats are present
    const teamAPlayers = await Player.find({ teamId: teamAId });
    const teamBPlayers = await Player.find({ teamId: teamBId });

    const getSquadAvg = (players: any[], pos: string[]) => {
      // Filter out injured players
      const availablePlayers = players.filter(p => !p.advancedStats?.isInjured);
      const filtered = availablePlayers.filter(p => pos.includes(p.position));
      if (filtered.length === 0) return 70;
      return filtered.reduce((acc, p) => acc + p.rating, 0) / filtered.length;
    };
    
    // Squad Analysis
    const tA_Attack = getSquadAvg(teamAPlayers, ['FW', 'Forward']);
    const tA_Midfield = getSquadAvg(teamAPlayers, ['MF', 'Midfielder']);
    const tA_Defense = getSquadAvg(teamAPlayers, ['DF', 'Defender', 'GK', 'Goalkeeper']);
    
    const tB_Attack = getSquadAvg(teamBPlayers, ['FW', 'Forward']);
    const tB_Midfield = getSquadAvg(teamBPlayers, ['MF', 'Midfielder']);
    const tB_Defense = getSquadAvg(teamBPlayers, ['DF', 'Defender', 'GK', 'Goalkeeper']);

    const teamAStarPlayers = teamAPlayers.filter(p => p.rating > 85 && !p.advancedStats?.isInjured).map(p => p.name);
    const teamBStarPlayers = teamBPlayers.filter(p => p.rating > 85 && !p.advancedStats?.isInjured).map(p => p.name);

    // Normalizing stats
    // Ranking: Max ranking is usually ~200. Higher score for lower ranking.
    const teamARankScore = Math.max(0, 200 - teamA.ranking) / 200;
    const teamBRankScore = Math.max(0, 200 - teamB.ranking) / 200;

    // Squad overall scores (normalized to 0-1 based on a max rating of ~100)
    let teamASquadScore = ((tA_Attack + tA_Midfield + tA_Defense) / 3) / 100;
    let teamBSquadScore = ((tB_Attack + tB_Midfield + tB_Defense) / 3) / 100;

    // Advanced Stats Integration (xG & Market Value)
    // If xG exists from API, boost the squad attacking score dynamically
    if (teamA.advancedStats?.expectedGoalsXG && teamA.advancedStats.expectedGoalsXG > 1.5) {
      teamASquadScore += 0.05;
    }
    if (teamB.advancedStats?.expectedGoalsXG && teamB.advancedStats.expectedGoalsXG > 1.5) {
      teamBSquadScore += 0.05;
    }

    // Market Value Comparison Bonus (Transfermarkt)
    let teamAMarketBonus = 0;
    let teamBMarketBonus = 0;
    const mvA = teamA.advancedStats?.marketValueEur || 0;
    const mvB = teamB.advancedStats?.marketValueEur || 0;
    if (mvA > 0 && mvB > 0) {
      if (mvA > mvB * 1.5) teamAMarketBonus = 0.05; // 50% more valuable squad
      if (mvB > mvA * 1.5) teamBMarketBonus = 0.05;
    }

    // Manager bonus (if known manager, slight boost)
    const teamAManagerBonus = teamA.coach && teamA.coach !== 'Unknown' && teamA.coach !== 'TBD' ? 0.05 : 0;
    const teamBManagerBonus = teamB.coach && teamB.coach !== 'Unknown' && teamB.coach !== 'TBD' ? 0.05 : 0;

    // Weights
    const W_RANK = 0.35; // slightly reduced to make room for H2H
    const W_SQUAD = 0.35;
    const W_FORM = 0.15;
    const W_MANAGER = 0.05;
    const W_H2H = 0.10;

    const scoreA = 
      (teamARankScore * W_RANK) + 
      (teamASquadScore * W_SQUAD) + 
      (teamAForm * W_FORM) + 
      (teamAManagerBonus * W_MANAGER) +
      teamAMarketBonus +
      teamAH2HBonus;

    const scoreB = 
      (teamBRankScore * W_RANK) + 
      (teamBSquadScore * W_SQUAD) + 
      (teamBForm * W_FORM) + 
      (teamBManagerBonus * W_MANAGER) +
      teamBMarketBonus +
      teamBH2HBonus;

    const totalScore = scoreA + scoreB;
    const probA = Math.round((scoreA / totalScore) * 100);
    const probB = 100 - probA;

    // Determine winner
    let winnerId = null;
    let confidence = 0;
    
    // Add small randomization buffer (-2 to +2) to break absolute deadlocks
    const randomBuffer = Math.floor(Math.random() * 5) - 2;
    const adjustedProbA = probA + randomBuffer;

    if (adjustedProbA > 50) {
      winnerId = teamAId;
      confidence = adjustedProbA;
    } else if (adjustedProbA < 50) {
      winnerId = teamBId;
      confidence = 100 - adjustedProbA;
    } else {
      confidence = 50; // Draw probability is high
    }

    // Explanation Generation
    let explanation = `The AI predicts a ${winnerId === teamAId ? teamA.name + ' win' : (winnerId === teamBId ? teamB.name + ' win' : 'draw')}. `;
    
    if (winnerId) {
      const winner = winnerId === teamAId ? teamA : teamB;
      const loser = winnerId === teamAId ? teamB : teamA;
      const winnerSquadScore = winnerId === teamAId ? teamASquadScore : teamBSquadScore;
      const loserSquadScore = winnerId === teamAId ? teamBSquadScore : teamASquadScore;
      const winnerStars = winnerId === teamAId ? teamAStarPlayers : teamBStarPlayers;
      const winnerH2HBonus = winnerId === teamAId ? teamAH2HBonus : teamBH2HBonus;

      if (winner.ranking < loser.ranking) {
        explanation += `${winner.name} holds a massive advantage in FIFA Rankings (Rank #${winner.ranking} vs #${loser.ranking}). `;
      }
      
      if (winnerSquadScore > loserSquadScore) {
        explanation += `Under the tactical guidance of manager ${winner.coach}, the overall squad depth and player stats are superior. `;
      }

      // Mention Advanced Stats if applicable
      const winnerXG = winner.advancedStats?.expectedGoalsXG || 0;
      const loserXG = loser.advancedStats?.expectedGoalsXG || 0;
      if (winnerXG > 0 && winnerXG > loserXG) {
        explanation += `Advanced FBref data shows ${winner.name} generates significantly more Expected Goals (xG), giving them a heavy attacking edge. `;
      }

      const winnerMV = winner.advancedStats?.marketValueEur || 0;
      const loserMV = loser.advancedStats?.marketValueEur || 0;
      if (winnerMV > 0 && winnerMV > loserMV * 1.5) {
        explanation += `Transfermarkt valuations also highlight a massive disparity in squad market value. `;
      }

      if (winnerH2HBonus > 0.05) {
        explanation += `Based on Kaggle's historical match data since 1872, ${winner.name} also heavily dominates the historical Head-to-Head matchups against ${loser.name}. `;
      }

      if (winnerStars.length > 0) {
        explanation += `Star players like ${winnerStars.slice(0, 2).join(', ')} are expected to tip the scales in this matchup.`;
      }
    } else {
      explanation += `Both teams are incredibly evenly matched. ${teamA.name}'s squad led by ${teamA.coach} will be rigorously tested against ${teamB.name}'s tactics.`;
    }
    
    res.json({
      teamA: {
        id: teamAId,
        name: teamA.name,
        probability: probA,
        score: Math.round(scoreA * 100) / 100
      },
      teamB: {
        id: teamBId,
        name: teamB.name,
        probability: probB,
        score: Math.round(scoreB * 100) / 100
      },
      prediction: {
        winnerId,
        confidence,
        explanation
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during prediction' });
  }
};
