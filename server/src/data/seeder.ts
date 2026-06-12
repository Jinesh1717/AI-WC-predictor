import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/db';
import Team from '../models/Team';
import Player from '../models/Player';
import Match from '../models/Match';

dotenv.config();

import fs from 'fs';
import path from 'path';

export const importData = async () => {
  try {
    const teamCount = await Team.countDocuments();
    if (teamCount > 0) {
      console.log('Clearing old mock data...');
      await Team.deleteMany();
      await Player.deleteMany();
      await Match.deleteMany();
    }
    
    // Read from real JSON files generated from the PDF
    let teamsPath = path.join(__dirname, 'realTeams.json');
    let playersPath = path.join(__dirname, 'realPlayers.json');
    
    // In production (dist), the JSON files might not be copied, so point to src/
    if (!fs.existsSync(teamsPath)) {
      teamsPath = path.join(__dirname, '../../src/data/realTeams.json');
      playersPath = path.join(__dirname, '../../src/data/realPlayers.json');
    }
    
    const teams = JSON.parse(fs.readFileSync(teamsPath, 'utf8'));
    const players = JSON.parse(fs.readFileSync(playersPath, 'utf8'));

    await Team.insertMany(teams);
    await Player.insertMany(players);

    // Mock match data
    const matches = [
      { id: 'm1', teamA: 'ARG', teamB: 'FRA', date: new Date('2026-06-20T18:00:00Z'), stage: 'Group Stage', status: 'Scheduled' },
      { id: 'm2', teamA: 'BRA', teamB: 'ENG', date: new Date('2026-06-22T15:00:00Z'), stage: 'Group Stage', status: 'Scheduled' },
      { id: 'm3', teamA: 'ESP', teamB: 'POR', date: new Date('2026-06-24T20:00:00Z'), stage: 'Group Stage', status: 'Scheduled' }
    ];
    await Match.insertMany(matches);

    console.log('Real Data Imported from PDF!');
  } catch (error) {
    console.error(`Error: ${error}`);
  }
};
