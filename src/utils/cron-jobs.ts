import {nodeCron} from "node-cron"
import pool from "../db/dbConnection"
import { checkAndUpdateLastRun } from "./helperFunction";


const startCronJobs = () => {
    //cron job to run every minute
    nodeCron.schedule("*/1 * * * *",async()=>{
    console.log("Cron Job Running: Checking due checks");
    //get all checks from the database whose last_run + interval_time <= current time
    const rows = await pool.query(`SELECT * FROM checks WHERE last_run IS NULL OR (last_run + interval_time * INTERVAL '1 minute') <= NOW();`)
        if (rows.rows.length === 0) {
  console.log("Cron: No checks due");
  return;
}

    for(const row of rows.rows){
        console.log(`Running check for: ${row.id} - ${row.name}`);
        await checkAndUpdateLastRun(row);
    }
})
}

export default startCronJobs;