import express from 'express';
import { createCheck,getChecks,check } from '../controllers/CheckController';
import { authCheck } from '../utils/Middleware';

const router = express.Router();

router.post('/create', authCheck ,createCheck);
router.get('/checks', authCheck ,getChecks);
router.post('/:id',authCheck,check);

export default router;