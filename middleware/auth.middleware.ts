import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;


export interface AuthRequest extends Request {
    user?: {
        id: number
    }
}

export const protect = (req: AuthRequest, res: Response, next: NextFunction): any => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split(' ')[1];

    try {

        const decoded = jwt.verify(token, JWT_SECRET) as { id: number }
        req.user = { id: decoded.id }
        next();

    } catch (err) {
        console.error('JWT Verification failed:', err);
        return res.status(401).json({ message: 'Invalid token' });
    }
}