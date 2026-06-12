import mongoose, { Document, Schema } from 'mongoose';

export interface ITeam extends Document {
  id: string;
  name: string;
  flag: string;
  ranking: number;
  coach: string;
  formation: string;
  stats: {
    goalsScored: number;
    goalsConceded: number;
    winRate: number;
    recentForm: number[]; // e.g., 1 for win, 0 for draw, -1 for loss
    attack: number;
    defense: number;
    midfield: number;
    experience: number;
    benchStrength: number;
    fitness: number;
  };
  advancedStats?: {
    marketValueEur?: number;
    expectedGoalsXG?: number;
    expectedGoalsAgainstXGA?: number;
    keyInjuries?: string[];
  };
}

const teamSchema = new Schema<ITeam>({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  flag: { type: String, required: true },
  ranking: { type: Number, required: true },
  coach: { type: String, required: true },
  formation: { type: String, required: true },
  stats: {
    goalsScored: { type: Number, default: 0 },
    goalsConceded: { type: Number, default: 0 },
    winRate: { type: Number, default: 0 },
    recentForm: { type: [Number], default: [] },
    attack: { type: Number, default: 0 },
    defense: { type: Number, default: 0 },
    midfield: { type: Number, default: 0 },
    experience: { type: Number, default: 0 },
    benchStrength: { type: Number, default: 0 },
    fitness: { type: Number, default: 0 },
  },
  advancedStats: {
    marketValueEur: { type: Number, default: 0 },
    expectedGoalsXG: { type: Number, default: 0 },
    expectedGoalsAgainstXGA: { type: Number, default: 0 },
    keyInjuries: { type: [String], default: [] }
  }
});

export default mongoose.model<ITeam>('Team', teamSchema);
