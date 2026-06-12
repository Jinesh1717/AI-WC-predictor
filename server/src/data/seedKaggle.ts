import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import HistoricalMatch from '../models/HistoricalMatch';

const csvPath = path.resolve(__dirname, '../../../../results.csv');

export async function seedKaggle() {
  const count = await HistoricalMatch.countDocuments();
  if (count > 0) {
    console.log('Kaggle data already seeded, skipping...');
    return;
  }

  const matches: any[] = [];
  console.log(`Reading CSV from ${csvPath}...`);

  return new Promise((resolve, reject) => {
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (data) => {
        if (data.home_team && data.away_team && data.home_score !== '' && data.away_score !== '') {
          matches.push({
            date: new Date(data.date),
            home_team: data.home_team,
            away_team: data.away_team,
            home_score: parseInt(data.home_score, 10),
            away_score: parseInt(data.away_score, 10),
            tournament: data.tournament,
            neutral: data.neutral === 'TRUE'
          });
        }
      })
      .on('end', async () => {
        console.log(`Parsed ${matches.length} matches. Inserting into database...`);
        const BATCH_SIZE = 5000;
        try {
          for (let i = 0; i < matches.length; i += BATCH_SIZE) {
            const batch = matches.slice(i, i + BATCH_SIZE);
            await HistoricalMatch.insertMany(batch);
            console.log(`Inserted ${Math.min(i + BATCH_SIZE, matches.length)} / ${matches.length}`);
          }
          console.log('Kaggle Historical Data seeded successfully!');
          resolve(true);
        } catch (err) {
          console.error(err);
          reject(err);
        }
      })
      .on('error', reject);
  });
}
