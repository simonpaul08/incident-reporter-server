import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

// hash password
export const hashPassword = async (password: string) => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
}

// compare password 
export const comparePassword = async (raw: string, hashed: string) => {
    return bcrypt.compare(raw, hashed);
};

// generate jwt token
export const generateToken = (userId: number): string => {
    return jwt.sign({ id: userId }, JWT_SECRET, {
        expiresIn: '7d',
    });
};

// generate incident id 
export const generateIncidentId = (): string => {
    const rand = Math.floor(10000 + Math.random() * 90000); 
    const year = new Date().getFullYear();
    return `RMG${rand}${year}`;
}