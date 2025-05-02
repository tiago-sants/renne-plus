import express from 'express';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = express.Router();

// Rotas serão implementadas posteriormente
router.get('/', authenticateJWT, (req, res) => {
  res.status(200).json({ message: 'Barber routes working' });
});

export default router;
