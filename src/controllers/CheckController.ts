import type { Request, Response } from "express";
import pool from "../utils/dbConnection";
import { createCheckErrorTable, createCheckTable } from "../utils/DBQueries";
import fetch from 'node-fetch';
import { checkIncident } from "../utils/helperFunction";
interface AuthRequest extends Request {
    userId?: string;
}

const createCheck = async (req: AuthRequest, res: Response) => {
    try {
        // await createCheckTable(); //for creating the check table
        const { name, url, method, expectedStatusCodes, timeout_ms } = req.body;
        const userId = req.userId;
        // Here, you would typically insert the new check into your database
        const check = await pool.query(`INSERT INTO checks(name,userID,url,method,expected_status,timeout_ms) VALUES($1,$2,$3,$4,$5,$6);`,
            [name, userId,url, method, expectedStatusCodes, timeout_ms]);
        if(check.rowCount === 0){
            res.status(400).json({
                success : false,
                message : "Check Creation Failed"
            })
        }
        res.status(200).json({
            success: true,
            message: "Check Created Successfully"
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
    }
}

const getChecks = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        const rows = await pool.query(`SELECT * FROM checks WHERE userId = $1;`,[userId]);
        const checks = rows.rows;
        res.status(200).json({
            success: true,
            message: "Checks Fetched Successfully",
            checks
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
    }
}
const check = async (req: AuthRequest, res: Response) => {
  try {
    // await createCheckErrorTable(); // Ensure the check_results table exists
    const userId = req.userId;
    const checkId = req.params.id;

    const result = await pool.query(
      `SELECT * FROM checks WHERE id = $1 AND userid = $2`,
      [checkId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Check not found"
      });
    }

    const check = result.rows[0];
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
        return res.status(502).json({
          success: false,
          message: `Expected ${check.expected_status}, got ${response.status}`,
          latency
        });
      }
      await pool.query(`INSERT INTO check_results(checkId,success,status_code,latency_ms) VALUES($1,$2,$3,$4)`,
          [check.id, true, response.status, latency]);
      await checkIncident(true, check.id); //handle incident creation
      return res.status(200).json({
        success: true,
        message: "Check successful",
        latency
      });

    } catch (err: any) { // catch fetch errors
      const end = process.hrtime.bigint(); //end time in nanoseconds
      const latency = Math.round(Number(end - start) / 1_000_000);

      if (err.name === "AbortError") {
        await pool.query(`INSERT INTO check_results(checkId,success,status_code,latency_ms) VALUES($1,$2,$3,$4)`,
          [check.id, false, null, latency]);
        await checkIncident(false, check.id); //handle incident creation
        return res.status(408).json({
          success: false,
          message: "Request timed out",
          latency
        });
      }
      await pool.query(`INSERT INTO check_results(checkId,success,status_code,latency_ms) VALUES($1,$2,$3,$4)`,
          [check.id, false, null, latency]);
      await checkIncident(false, check.id); //handle incident creation
      return res.status(502).json({
        success: false,
        message: "Failed to reach API",
        latency
      });
    } finally {
      clearTimeout(timeout);
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};


const getCheckResults = async(req : AuthRequest, res: Response) => {
  try {
        const checkId = req.params.id;
        const query = req.query;
        if(query === undefined){
          res.status(400).json({
            success : false,
            message : "Bad Request"
          })
        }
        const rows = await pool.query(`SELECT * FROM check_results WHERE checkid = $1 order by created_at DESC LIMIT $2;`,[checkId,query.limit]);
        const check_results = rows.rows;
        res.status(200).json({
            success: true,
            message: "Check Results Fetched Successfully",
            check_results
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
    }
}



export {createCheck,getChecks,check,getCheckResults};