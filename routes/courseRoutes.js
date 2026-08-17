import express from "express"
import { createCourse, deleteCourse, getAllCourses, updateCourse } from "../controllers/courseControllers.js" 
import {isLoggedIn, authorizedRoles} from "../middlewares/authMiddleware.js" 
import upload from "../middlewares/multerMiddleware.js"

const router = express.Router() 


// fetch all courses
router.get("/", getAllCourses) 

// create course
router.post("/",
    isLoggedIn,
    authorizedRoles(['ADMIN']),
    upload.single('thumbnail'),
    createCourse
) 

// update course
router.put("/:courseId",
    isLoggedIn,
    authorizedRoles(['ADMIN']),
    upload.single('thumbnail'),
    updateCourse
) 

// delete course
router.delete("/:courseId",
    isLoggedIn,
    authorizedRoles(['ADMIN']),
    deleteCourse
) 


export default router 