import pool from "./dbConnection";
import { createIncidentTable } from "./DBQueries";

//Incident handling logic here
const checkIncident = async(success: boolean , checkid: string) => {
    await createIncidentTable(); //Ensure the incident table exists
    if(!success){ //In case of failure
        //check if incident already exists for this check
        const incidentExists = await pool.query(`SELECT * FROM incidents WHERE checkid = $1 AND status = 'open';`,[checkid]);
        if(incidentExists.rowCount === 0){
            //check if the last 3 incidents were failures
            const lastResults = await pool.query(`SELECT success FROM check_results WHERE checkid = $1 ORDER BY created_at DESC LIMIT 3;`,[checkid]);
            const results = lastResults.rows;
            if(results.length === 3 && results.every((result) => result.success === false)){ //checking if all last 3 results were failures
                //Create a new incident
                await pool.query(`INSERT INTO incidents(checkid,status) VALUES($1,'open');`,[checkid]);
            }
        }
        return;
    }
    //in case of success
    //Resolve any existing incident for this check
    await pool.query(`UPDATE incidents SET status = 'resolved',resolved_at = CURRENT_TIMESTAMP WHERE checkid = $1 AND status = 'open';`,[checkid]);
}


export { checkIncident };