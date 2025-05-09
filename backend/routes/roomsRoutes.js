import express from 'express';
import { createRoom } from '../controllers/roomsController.js';

const router = express.Router();
router.post('/', createRoom);

export default router;
