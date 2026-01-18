import pool from "../db/dbConnection";
import { createIncidentTable } from "../db/DBQueries";

//Incident handling logic here using transactions
const checkIncident = async(success: boolean , checkid: string) => {
    // await createIncidentTable(); //Ensure the incident table exists
    const client = await pool.connect(); //get a client from the pool dedicatedly
    try {
        await client.query('BEGIN;');
    if(!success){ //In case of failure
        //check if incident already exists for this check
        const incidentExists = await client.query(`SELECT * FROM incidents WHERE checkid = $1 AND status = 'open';`,[checkid]);
        if(incidentExists.rowCount === 0){
            //check if the last 3 incidents were failures
            const lastResults = await client.query(`SELECT success FROM check_results WHERE checkid = $1 ORDER BY created_at DESC LIMIT 3;`,[checkid]);
            const results = lastResults.rows;
            if(results.length === 3 && results.every((result) => result.success === false)){ //checking if all last 3 results were failures
                //Create a new incident
                await client.query(`INSERT INTO incidents(checkid,status) VALUES($1,'open');`,[checkid]);
            }
        }
    }
    else{
      //in case of success
        //Resolve any existing incident for this check
        await client.query(`UPDATE incidents SET status = 'resolved',resolved_at = CURRENT_TIMESTAMP WHERE checkid = $1 AND status = 'open';`,[checkid]);
    }
    await client.query('COMMIT;');
    } catch (error) {
        await client.query('ROLLBACK;');
        console.log(error);
    }
    finally{
        client.release(); //return client to the pool
    }
}


export { checkIncident };