import express from 'express';
import { createRoom, getRoomById,joinRoom,getPlayersInRoom } from '../controllers/roomController.js';

const router = express.Router();

router.post('/create', createRoom);
router.get('/:roomId', getRoomById);
router.post("/:roomId/join", joinRoom);
router.get('/rooms/:roomId/players', getPlayersInRoom);

export default router;
