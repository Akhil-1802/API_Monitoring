import type { NextFunction, Request, Response } from "express";
import jwt from 'jsonwebtoken'

interface AuthRequest extends Request {
    userId?: string;
}

const authCheck = async(req : AuthRequest, res : Response,next : NextFunction) =>{
    try {
        const token = req.headers.authorization?.split(' ')[1]; //token from header
        if(!token) return res.status(401).json({message : "Access Denied! No Token Provided"}); //Unauthorized
        //Verify Token
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
        req.userId = (decoded as any).userId;
        next();
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success : false,
            message : "Internal Server Error"
        })
    }
}

export {authCheck}