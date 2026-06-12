import express from 'express';
import Match from '../models/Match';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const matches = await Match.find().populate('teamA').populate('teamB');
    res.json(matches);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching matches' });
  }
});

export default router;
