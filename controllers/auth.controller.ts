import { Request, Response } from "express";
import { db } from "../drizzle/db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { comparePassword, generateToken, hashPassword } from "../utils/utils";

// Register - POST
export const register = async (req: Request, res: Response): Promise<any> => {
    try {
        const { firstName, lastName, email, mobile, password, ...rest } = req.body;

        if (!firstName || !lastName || !email || !mobile || !password) {
            return res.status(400).json({ message: "required fields are missing" })
        }

        // duplicate 
        const duplicate = await db
            .select()
            .from(users)
            .where(eq(users.email, email))

        if (duplicate.length > 0) {
            return res.status(409).json({ message: "user with this email already exists" })
        }


        const hashed = await hashPassword(password);

        const user = await db.insert(users)
            .values({
                email,
                password: hashed,
                firstName,
                lastName,
                mobile,
                ...rest
            }).returning()

        res.status(201).json({ message: "user registered successfully", user })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: "server error" })
    }

}


// Login - POST
export const login = async (req: Request, res: Response): Promise<any> => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "required fields are missing" })
        }

        // check user 
        const user = await db.select()
            .from(users)
            .where(eq(users.email, email))

        if (user.length === 0) {
            return res.status(404).json({ message: "user does not exists" })
        }

        // compare passwords 
        const isPassword = await comparePassword(password, user[0].password)

        if (!isPassword) {
            return res.status(400).json({ message: "wrong credentials" })
        }

        const token = generateToken(user[0].id);

        const { password: pass, ...rest } = user[0];

        res.status(200).json({ message: "logged in successfully", user: rest, token })

    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "server error" })
    }
}