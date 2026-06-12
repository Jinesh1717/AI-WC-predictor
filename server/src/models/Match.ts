import mongoose, { Document, Schema } from 'mongoose';

export interface IMatch extends Document {
  id: string;
  teamA: string;
  teamB: string;
  date: Date;
  stage: string; // e.g., 'Group Stage', 'Round of 16', 'Quarter Final', etc.
  status: 'Scheduled' | 'Completed';
  result?: {
    teamAScore: number;
    teamBScore: number;
    winner: string; // 'teamA', 'teamB', or 'draw'
  };
}

const matchSchema = new Schema<IMatch>({
  id: { type: String, required: true, unique: true },
  teamA: { type: String, required: true, ref: 'Team' },
  teamB: { type: String, required: true, ref: 'Team' },
  date: { type: Date, required: true },
  stage: { type: String, required: true },
  status: { type: String, enum: ['Scheduled', 'Completed'], default: 'Scheduled' },
  result: {
    teamAScore: { type: Number },
    teamBScore: { type: Number },
    winner: { type: String }
  }
});

export default mongoose.model<IMatch>('Match', matchSchema);
