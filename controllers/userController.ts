import { Request, Response } from "express";
import { db } from "../drizzle/db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";


// get user by ID - GET
export const getUserById = async (req: Request, res: Response): Promise<any> => {
    const { id } = req.params;

    if(!id) {
        return res.status(400).json({ message: "id is missing" })
    }

    // find user 
    const user = await db.select()
        .from(users)
        .where(eq(users.id, Number(id)))

    if(!user.length) {
        return res.status(404).json({ message: "user does not exists" })
    }

    res.status(200).json({ message: "user fetched successfully", user })
}