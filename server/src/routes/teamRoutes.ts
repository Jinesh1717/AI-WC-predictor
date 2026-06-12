import express from 'express';
import Team from '../models/Team';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const teams = await Team.find().sort({ ranking: 1 });
    res.json(teams);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching teams' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const team = await Team.findOne({ id: req.params.id });
    if (team) {
      res.json(team);
    } else {
      res.status(404).json({ message: 'Team not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching team' });
  }
});

export default router;
