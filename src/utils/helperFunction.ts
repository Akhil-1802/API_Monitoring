import pool from "../db/dbConnection";

export interface checkParams{
    id : string;
    url : string;
    method : string;
    timeout_ms : number;
    expected_status : number;
    name : string;
    interval_time : number;
    last_run : Date | null;
}
//Incident handling logic here using transactions
const checkIncident = async(success: boolean , checkid: string) => {
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

const checkAndUpdateLastRun = async (check : checkParams) => {

  try {
    //update last_run to current timestamp
    await pool.query(`UPDATE checks SET last_run = CURRENT_TIMESTAMP WHERE id = $1;`,[check.id]);
     //abort controller for timeout
    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      Number(check.timeout_ms)
    );//timeout in ms as soon as timeout occurs abort the fetch request

    const start = process.hrtime.bigint();//start time in nanoseconds

    try {
      const response = await fetch(check.url, {
        method: check.method,
        signal: controller.signal //attach the signal to fetch request, so that it can be aborted
      });

      const end = process.hrtime.bigint(); //end time in nanoseconds
     const latency = Math.round(Number(end - start) / 1_000_000); //latency in milliseconds

      if (response.status !== check.expected_status) {
        await pool.query(`INSERT INTO check_results(checkId,success,status_code,latency_ms) VALUES($1,$2,$3,$4)`,
          [check.id, false, response.status, latency]);
        
        await checkIncident(false, check.id); //handle incident creation
        return;
      }
      await pool.query(`INSERT INTO check_results(checkId,success,status_code,latency_ms) VALUES($1,$2,$3,$4)`,
          [check.id, true, response.status, latency]);
      await checkIncident(true, check.id); //handle incident creation
      return;

    } catch (err: any) { // catch fetch errors
      const end = process.hrtime.bigint(); //end time in nanoseconds
      const latency = Math.round(Number(end - start) / 1_000_000);

      if (err.name === "AbortError") {
        await pool.query(`INSERT INTO check_results(checkId,success,status_code,latency_ms) VALUES($1,$2,$3,$4)`,
          [check.id, false, null, latency]);
        await checkIncident(false, check.id); //handle incident creation
       return;
      }
      await pool.query(`INSERT INTO check_results(checkId,success,status_code,latency_ms) VALUES($1,$2,$3,$4)`,
          [check.id, false, null, latency]);
      await checkIncident(false, check.id); //handle incident creation
      return;
    } finally {
      clearTimeout(timeout);
    }

  } catch (error) {
    console.error(error);
  }
}



async function waitForDB() {
  while (true) {
    try {
      await pool.query("SELECT 1");
      console.log("Database connected");
      break;
    } catch {
      console.log("Waiting for database...");
      await new Promise(r => setTimeout(r, 2000));
    }
  }
}

export { checkIncident ,checkAndUpdateLastRun,waitForDB};