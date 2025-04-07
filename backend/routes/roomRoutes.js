import express from 'express';
import { createRoom, joinRoom } from '../controllers/roomController.js';

const router = express.Router();

router.post('/create-room', createRoom);
router.post('/join-room', joinRoom);

export default router;
