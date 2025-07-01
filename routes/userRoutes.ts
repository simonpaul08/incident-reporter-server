import { Router } from "express";
import { getUserById } from "../controllers/userController";

const router = Router()


router.route("/:id")
    .get(getUserById)

export default router;