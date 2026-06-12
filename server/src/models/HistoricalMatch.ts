import mongoose, { Document, Schema } from 'mongoose';

export interface IHistoricalMatch extends Document {
  date: Date;
  home_team: string;
  away_team: string;
  home_score: number;
  away_score: number;
  tournament: string;
  neutral: boolean;
}

const historicalMatchSchema: Schema = new Schema({
  date: { type: Date, required: true },
  home_team: { type: String, required: true, index: true },
  away_team: { type: String, required: true, index: true },
  home_score: { type: Number, required: true },
  away_score: { type: Number, required: true },
  tournament: { type: String },
  neutral: { type: Boolean, default: false }
});

export default mongoose.model<IHistoricalMatch>('HistoricalMatch', historicalMatchSchema);
