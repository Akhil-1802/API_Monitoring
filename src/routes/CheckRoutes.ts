import express from 'express';
import { createCheck,getChecks,check, getCheckResults } from '../controllers/CheckController';
import { authCheck } from '../middleware/Middleware';

const router = express.Router();

router.post('/', authCheck ,createCheck); //router for creating a api_check
router.get('/', authCheck ,getChecks);  //router for getting all checks of a user
router.post('/:id',authCheck,check);    //router for performing a check on api
router.get('/:id/results',authCheck,getCheckResults);  //router for getting all check results for a particular check


export default router;