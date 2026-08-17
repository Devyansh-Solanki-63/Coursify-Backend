import dotenv from "dotenv"
dotenv.config()
import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import morgan from "morgan"
import cloudinary from "cloudinary"
import Razorpay from "razorpay"
import dbConnection from "./config/dbConnection.js"
import userRoutes from "./routes/userRoutes.js"
import courseRoutes from "./routes/courseRoutes.js"
import lectureRoutes from "./routes/lectureRoutes.js"
import paymentRoutes from "./routes/paymentRoutes.js"
import miscRoutes from './routes/miscellaneousRoutes.js'


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

let isDBConnected = false
app.use(async (req, res, next) => {
    if (!isDBConnected) {
        isDBConnected = dbConnection();
    }
    next();
})

app.use("/api/v1/user", userRoutes)
app.use("/api/v1/courses", courseRoutes)
app.use("/api/v1/courses/lectures", lectureRoutes)
app.use("/api/v1/payments", paymentRoutes)
app.use('/api/v1', miscRoutes);

app.all('*', (req, res) => {
    res.status(404).send("OOPS..! 404 page not found")
})

// cloudinary configuration          
cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY,
    key_secret: process.env.RAZORPAY_SECRET
})

export { razorpay }
export default app 