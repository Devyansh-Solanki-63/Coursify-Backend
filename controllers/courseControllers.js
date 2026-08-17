import Course from "../models/courseModel.js"
import uploadThumbnail from "../utils/uploadThumbnail.js"
import cloudinary from "cloudinary"

const getAllCourses = async (req, res) => {
    try{
        const result = await Course.find({}).select('-lectures')

        res.status(200).json({
            success: true,
            message: "All courses fetched successfully",
            courses: result
        })
    }
    catch(error){
        res.status(400).json({
            success: false,
            message: error.message
        })
    }
}


const createCourse = async (req, res) => {
    try{
        const {title, description, category, createdBy} = req.body

        if(!title || !description || !category || !createdBy){
            throw new Error("all fields are mandetory")
        }

        const result = await Course.create(req.body)

        if(req.file){
            const uploadedImage = await uploadThumbnail(req.file.buffer) 

            result.thumbnail.public_id = uploadedImage.public_id
            result.thumbnail.secure_url = uploadedImage.secure_url

            await result.save()
        }

        res.status(200).json({
            success: true,
            message: "course created successfully",
            result
        })
    }
    catch(error){
        res.status(400).json({
            success: false,
            message: error.message
        })
    }
}


const deleteCourse = async (req, res) => {
    try{
        const {courseId} = req.params

        await Course.findByIdAndDelete(courseId)

        res.status(200).json({
            success: true,
            message: "course deleted successfully"
        })
    }
    catch(error){
        res.status(400).json({
            success: false,
            message: `This course does not exist... ${error.message}`
        })
    }
}


const updateCourse = async (req, res) => {
    try{
        const {courseId} = req.params
        const {title, description, category, createdBy} = req.body

        if(!title || !description || !category || !createdBy){
            throw new Error("all fields are mandetory")
        }

        const result = await Course.findById(courseId)

        if(!result){
            throw new Error("This course does not exist")
        }

        result.title = title
        result.description = description
        result.category = category
        result.createdBy = createdBy

        if(req.file){
            if(result.thumbnail != "null"){
                await cloudinary.v2.uploader.destroy(result.thumbnail?.public_id)  // removing existing image
            }

            // new Image file uploading in cloudinary
            const uploadedImage = await uploadThumbnail(req.file.buffer) 

            result.thumbnail.public_id = uploadedImage.public_id;
            result.thumbnail.secure_url = uploadedImage.secure_url;
        }

        await result.save()

        res.status(200).json({
            success: true,
            message: "course updated successfully",
            course: result
        })
    }
    catch(error){
        res.status(400).json({
            success: false,
            message: error.message
        })
    }
}


export {getAllCourses, createCourse, deleteCourse, updateCourse} 