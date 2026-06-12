import express from 'express';
import { predictMatch } from '../services/predictionService';

const router = express.Router();

router.post('/', predictMatch);

export default router;
