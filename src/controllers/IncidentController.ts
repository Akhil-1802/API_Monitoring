import type { Response } from "express";
import type { AuthRequest } from "./CheckController";
import pool from "../db/dbConnection";

//get all incidents for a user using optional query param checkId
const getIncidents = async(req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        const { checkId } = req.query as { checkId?: string };
        let rows;
        if(checkId){ //if checkId is provided in query param
            
            const _rows = await pool.query(`SELECT p.id,
          p.status,
          p.started_at,
          p.resolved_at,
          p.checkid FROM public.incidents as p INNER JOIN  public.checks as c ON p.checkid = c.id WHERE c.id = $1 AND c.userId = $2`,[checkId,userId]); //fetch incidents for that particular check
            rows=  _rows.rows;
            
        }
        else{
            const _rows = await pool.query(`SELECT p.id,
          p.status,
          p.started_at,
          p.resolved_at,
          p.checkid FROM public.incidents as p INNER JOIN  public.checks as c ON p.checkid = c.id INNER JOIN users as u ON u.id = c.userId WHERE c.userId = $1;`,[userId]);
            rows = _rows.rows;
        }
        
        //if no checkId is provided, fetch all incidents for the user
        if(rows.length === 0){
            return res.status(200).json({
                success: true,
                message: "No incidents found",
                incidents : []
            })
        }
        res.status(200).json({
            success: true,
            message: "Incidents Fetched Successfully",
            rows
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
    }
}


export { getIncidents}