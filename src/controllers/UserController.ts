import {  type Request, type Response } from "express";
import { createUserTable } from "../utils/DBQueries";
import pool from "../utils/dbConnection";
import bcrypt from 'bcrypt'


const registerUser = async(req : Request,res : Response) =>{
    try {
        // await createUserTable(); for creating the user table
        const body = req.body;
        const {username , email , password } = body;
        const user = await pool.query(`SELECT * FROM users
                                    WHERE email = $1`,[email]);
        if(user.rows.length > 0) return res.status(300).json({message : "User already registered!"});
        const hashedPassword = await bcrypt.hash(password,10);

        const new_user = await pool.query(`INSERT INTO users(username,email,password) VALUES($1,$2,$3)`,[username,email,hashedPassword]);
        res.status(201).json({success: true,
            message : "User Created False",
            new_user
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success : false,
            message : "Internal Server Error"
        })
    }
}


const loginUser = async(req : Request, res : Response) =>{
    try {
        
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success : false,
            message : "Internal Server Error"
        })
    }
}

export {registerUser,loginUser}