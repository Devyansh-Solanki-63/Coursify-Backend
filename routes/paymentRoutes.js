import express from "express"
import { allPayments, cancelSubscription, getRazorpayKey, buySubscription, verifySubscription } from "../controllers/paymentControllers.js"
import { authorizedRoles, isLoggedIn } from "../middlewares/authMiddleware.js"


const router = express.Router()

router.get("/", isLoggedIn, authorizedRoles(['ADMIN']), allPayments)
router.get("/razorpaykey", isLoggedIn, getRazorpayKey)
router.post("/subscribe", isLoggedIn, buySubscription)
router.post("/verify", isLoggedIn, verifySubscription)
router.post("/unsubscribe", isLoggedIn, cancelSubscription)

export default router