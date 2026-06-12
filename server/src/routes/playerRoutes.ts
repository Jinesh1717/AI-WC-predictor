import express from 'express';
import Player from '../models/Player';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const players = await Player.find().populate('teamId');
    res.json(players);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching players' });
  }
});

export default router;
