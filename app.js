import dotenv from "dotenv"
dotenv.config()
import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import morgan from "morgan"
import dbConnection from "./config/dbConnection.js"
import userRoutes from "./routes/userRoutes.js"
import courseRoutes from "./routes/courseRoutes.js"
import lectureRoutes from "./routes/lectureRoutes.js"
import paymentRoutes from "./routes/paymentRoutes.js"
import miscRoutes from './routes/miscellaneousRoutes.js';


let isDBConnected = false
if (!isDBConnected) {
    isDBConnected = dbConnection();
}

const app = express()

// ------------------------ express middlewares
app.use(express.json())
app.use(cors({
    origin: [process.env.PROD == "true" ? process.env.CLIENT_URL : process.env.CLIENT_LOCAL_URL],
    credentials: true
}))
app.use(cookieParser())
// ------------------------ express middlewares

app.use(morgan('dev'))

app.use("/home", (req, res) => {
    res.send("hello")
})

app.use("/api/v1/user", userRoutes)
app.use("/api/v1/courses", courseRoutes)
app.use("/api/v1/courses/lectures", lectureRoutes)
app.use("/api/v1/payments", paymentRoutes)
app.use('/api/v1', miscRoutes);

app.all('*', (req, res) => {
    res.status(404).send("OOPS..! 404 page not found")
})

export default app 