import express from 'express';
import { authCheck } from '../middleware/Middleware';
import { getIncidents } from '../controllers/IncidentController';


const router = express.Router();

router.get('/',authCheck, getIncidents); //router for getting all incidents for a user



export default router;