import express from 'express'
import userRouter from './src/routes/UserRoutes'
import checkRouter from './src/routes/CheckRoutes'
import incidentRouter from './src/routes/IncidentRoutes'
import startCronJobs from './src/utils/cron-jobs'
import dotenv from 'dotenv'
import { waitForDB } from './src/utils/helperFunction'

dotenv.config();
const  PORT = process.env.PORT || 3000;
const app = express();

//middleware
app.use(express.json());
app.use(express.urlencoded({extended : true}));

//routes
app.use('/api/user',userRouter);
app.use('/api/check',checkRouter);
app.use('/api/incident',incidentRouter);
await waitForDB()
startCronJobs();
//start server
app.listen(PORT, () => {
        console.log(`Server is running on ${3000}`)
})