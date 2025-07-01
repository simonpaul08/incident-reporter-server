import express from "express";
import cors from "cors";
import morgan from "morgan";
import AuthRoutes from "./routes/authRoutes";
import IncidentRoutes from "./routes/incidentRoutes";
import UserRoutes from "./routes/userRoutes";
import { protect } from "./middleware/auth.middleware";
import cookieParser from "cookie-parser";


const PORT = process.env.PORT || 3000;


const app = express();

// middlewares
app.use(express.json())
app.use(cors())
app.use(cookieParser())
app.use(morgan("dev"))


// health check 
app.get("/", (req, res) => {
    res.status(200).json({ message: "server is up and running" })
})

//routes 
app.use("/api/auth", AuthRoutes)
app.use(protect)
app.use("/api/user", UserRoutes)
app.use("/api/incident", IncidentRoutes)



app.listen(PORT, () => {
    console.log(`server is running on PORT: ${PORT}`)
})