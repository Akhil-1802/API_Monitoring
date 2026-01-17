import express from 'express';
import { createCheck,getChecks,check, getCheckResults } from '../controllers/CheckController';
import { authCheck } from '../utils/Middleware';

const router = express.Router();

router.post('/', authCheck ,createCheck);
router.get('/', authCheck ,getChecks);
router.post('/:id',authCheck,check);
router.get('/:id/results',authCheck,getCheckResults)

export default router;