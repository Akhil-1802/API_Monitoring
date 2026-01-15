import express from 'express';
import { createCheck,getChecks,check } from '../controllers/CheckController';
import { authCheck } from '../utils/Middleware';

const router = express.Router();

router.post('/', authCheck ,createCheck);
router.get('/', authCheck ,getChecks);
router.post('/:id',authCheck,check);

export default router;