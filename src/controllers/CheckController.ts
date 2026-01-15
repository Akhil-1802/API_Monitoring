import type { Request, Response } from "express";
import pool from "../utils/dbConnection";
import { createCheckTable } from "../utils/DBQueries";
import fetch from 'node-fetch';
interface AuthRequest extends Request {
    userId?: number;
}

const createCheck = async (req: AuthRequest, res: Response) => {
    try {
        await createCheckTable(); //for creating the check table
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

const check = async(req : AuthRequest,res : Response) => {
    try {
        const checkId = req.params.id;
        const row = await pool.query(`SELECT * FROM checks WHERE id = $1;`, [checkId]);
        const check = row.rows[0];
        const startTime = performance.now();
        const response = await fetch(check.url, { method: check.method });
        const endTime = performance.now();
        const latency = endTime - startTime;
        if(latency > parseInt(check.timeout_ms)) {
            return res.status(408).json({
                success: false,
                message: "Request Timeout"
            })
        }
        if(response.status !== check.expected_status) {
            return res.status(502).json({
                success: false,
                message: `Expected status ${check.expected_status} but got ${response.status}`
            })
        }
        res.status(200).json({
            success: true,
            message: "Check Successful",
            latency
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
    }
}




export {createCheck,getChecks,check};