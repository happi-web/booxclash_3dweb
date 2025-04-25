import express from 'express';
import { createRoom, getRoomById,joinRoom } from '../controllers/roomController.js';

const router = express.Router();

router.post('/create', createRoom);
router.get('/:roomId', getRoomById);
router.post("/:roomId/join", joinRoom);

export default router;
