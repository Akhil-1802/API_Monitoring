import type { Request, Response } from "express";
import pool from "../utils/dbConnection";
import { createCheckErrorTable, createCheckTable } from "../utils/DBQueries";
import fetch from 'node-fetch';
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

    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      Number(check.timeout_ms)
    );

    const start = process.hrtime.bigint();

    try {
      const response = await fetch(check.url, {
        method: check.method,
        signal: controller.signal
      });

      const end = process.hrtime.bigint();
     const latency = Math.round(Number(end - start) / 1_000_000);

      if (response.status !== check.expected_status) {
        await pool.query(`INSERT INTO check_results(checkId,success,status_code,latency_ms) VALUES($1,$2,$3,$4)`,
          [check.id, false, response.status, latency]);
        return res.status(502).json({
          success: false,
          message: `Expected ${check.expected_status}, got ${response.status}`,
          latency
        });
      }
      await pool.query(`INSERT INTO check_results(checkId,success,status_code,latency_ms) VALUES($1,$2,$3,$4)`,
          [check.id, true, response.status, latency]);
      return res.status(200).json({
        success: true,
        message: "Check successful",
        latency
      });

    } catch (err: any) {
      const end = process.hrtime.bigint();
      const latency = Math.round(Number(end - start) / 1_000_000);

      if (err.name === "AbortError") {
        await pool.query(`INSERT INTO check_results(checkId,success,status_code,latency_ms) VALUES($1,$2,$3,$4)`,
          [check.id, false, null, latency]);
        return res.status(408).json({
          success: false,
          message: "Request timed out",
          latency
        });
      }
      await pool.query(`INSERT INTO check_results(checkId,success,status_code,latency_ms) VALUES($1,$2,$3,$4)`,
          [check.id, false, null, latency]);
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




export {createCheck,getChecks,check};