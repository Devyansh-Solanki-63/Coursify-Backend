import {Router} from "express"
import {isLoggedIn} from "../middlewares/authMiddleware.js" 
import upload from "../middlewares/multerMiddleware.js" 
import { register, login, logout, profile, forgotPassword, resetPassword, updateProfile, checkLoginToken } from "../controllers/userControllers.js" 

const router = Router()

router.post("/register", upload.single("avatar"), register)
router.post("/login", login)
router.get("/logout", logout)
router.get("/check-token", isLoggedIn, checkLoginToken)
router.get("/profile", isLoggedIn, profile)
router.post("/forgot", forgotPassword)
router.post("/reset/:resetToken", resetPassword)
router.put("/update-profile", isLoggedIn, upload.single("avatar"), updateProfile)

export default router 