import express from "express"
import { getLecturesByCourseId, createLectureByCourseId, updateLectureByCourseId, deleteLectureByCourseId } from "../controllers/lectureControllers.js" 
import {isLoggedIn, authorizedRoles} from "../middlewares/authMiddleware.js" 
import upload from "../middlewares/multerMiddleware.js"

const router = express.Router() 


// fetch lectures of particular course by course id.
router.get("/:courseId",
    isLoggedIn,
    getLecturesByCourseId
)

// create lecture of particular course by course id.
router.post("/:courseId",
    isLoggedIn,
    authorizedRoles(['ADMIN']),
    upload.single('lecture'),
    createLectureByCourseId
)

router.put("/:courseId/:lectureNumber",
    isLoggedIn,
    authorizedRoles(['ADMIN']),
    upload.single('lecture'),
    updateLectureByCourseId
)

router.delete("/:courseId/:lectureNumber",
    isLoggedIn,
    authorizedRoles(['ADMIN']),
    deleteLectureByCourseId
)


export default router 