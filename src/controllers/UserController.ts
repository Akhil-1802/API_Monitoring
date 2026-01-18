import {  type Request, type Response } from "express";
import { createUserTable } from "../db/DBQueries";
import pool from "../db/dbConnection";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'


const registerUser = async(req : Request,res : Response) =>{
    try {
        // await createUserTable(); //for creating the user table
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
        const {email,password} = req.body;
        //Check whether user exists
        const user = await pool.query(`SELECT * FROM users WHERE email = $1`,[email]);
        if(user.rows.length === 0) return res.status(404).json({message : "User not found!"});
        //get userdata
        const userData = user.rows[0];
        const validPassword = await bcrypt.compare(password,userData.password); //Compare hashed password
        if(!validPassword) return res.status(401).json({message : "Invalid Credentials!"});//Unauthorized

        //Generate JWT Token
        const token = jwt.sign({userId : userData.id},process.env.JWT_SECRET as string,{expiresIn : '24h',algorithm : 'HS256'});
        //Add token in the cookie
        res.cookie("access_token", token, {
  httpOnly: true,
  secure: true,          // true in production (HTTPS)
  sameSite: "strict",    // or "lax"
  maxAge: 15 * 60 * 1000 // 15 minutes
});
        res.status(200).json({
            success : true,message :"Login Successful"
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success : false,
            message : "Internal Server Error"
        })
    }
}


export {registerUser,loginUser}