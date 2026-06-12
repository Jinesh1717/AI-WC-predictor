import mongoose, { Document, Schema } from 'mongoose';

export interface IPlayer extends Document {
  id: string;
  teamId: string;
  name: string;
  photo: string;
  position: string;
  rating: number;
  stats: {
    goals: number;
    assists: number;
    passAccuracy: number;
    dribbles: number;
    tackles: number;
  };
  isStarPlayer: boolean;
  advancedStats?: {
    marketValueEur?: number;
    expectedGoalsXG?: number;
    expectedAssistsXA?: number;
    isInjured?: boolean;
  };
}

const playerSchema = new Schema<IPlayer>({
  id: { type: String, required: true, unique: true },
  teamId: { type: String, required: true, ref: 'Team' },
  name: { type: String, required: true },
  photo: { type: String },
  position: { type: String, required: true },
  rating: { type: Number, required: true },
  stats: {
    goals: { type: Number, default: 0 },
    assists: { type: Number, default: 0 },
    passAccuracy: { type: Number, default: 0 },
    dribbles: { type: Number, default: 0 },
    tackles: { type: Number, default: 0 },
  },
  isStarPlayer: { type: Boolean, default: false },
  advancedStats: {
    marketValueEur: { type: Number, default: 0 },
    expectedGoalsXG: { type: Number, default: 0 },
    expectedAssistsXA: { type: Number, default: 0 },
    isInjured: { type: Boolean, default: false }
  }
});

export default mongoose.model<IPlayer>('Player', playerSchema);
