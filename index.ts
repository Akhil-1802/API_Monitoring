import express from 'express'
import { createCheckTable } from './src/utils/DBQueries';
import userRouter from './src/routes/UserRoutes'
import dotenv from 'dotenv'

dotenv.config();
const  PORT = process.env.PORT || 3000;
const app = express();

app.use(express.json());
app.use('/api/user',userRouter);

app.listen(PORT, () => {
        // createCheckTable(); To create the table
        console.log(`Server is running on ${3000}`)
})