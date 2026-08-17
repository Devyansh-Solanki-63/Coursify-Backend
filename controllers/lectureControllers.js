import Course from "../models/courseModel.js"
import cloudinary from "cloudinary"
import uploadLecture from "../utils/uploadLecture.js";


const getLecturesByCourseId = async (req, res) => {
    try {
        const { courseId } = req.params

        const result = await Course.findById(courseId)

        if (!result) {
            throw new Error("This course does not exist")
        }

        res.status(200).json({
            success: true,
            message: "lectures fetched successfully",
            lectures: result.lectures
        })
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        })
    }
}

const createThumbnailFromRemoteVideo = async (videoPublicId) => {
    return cloudinary.v2.url(videoPublicId, {
        resource_type: "video",
        format: 'png',
        start_offset: '0.1'
    })
};


const createLectureByCourseId = async (req, res) => {
    try {
        const { courseId } = req.params
        const { title, description } = req.body

        if (!title || !description) {
            throw new Error("all fields are required")
        }

        const result = await Course.findById(courseId)
        if (!result) {
            throw new Error("This course does not exist")
        }

        const lecture = {
            title,
            description,
            lecture: { public_id: '', secure_url: '' },
            thumbnail: { public_id: '', secure_url: '' }
        }

        if (req.file) {
            const uploadedVideo = await uploadLecture(req.file.buffer)

            if (uploadedVideo) {
                lecture.lecture.public_id = uploadedVideo.public_id
                lecture.lecture.secure_url = uploadedVideo.secure_url

                const thumbnailUrl = await createThumbnailFromRemoteVideo(uploadedVideo.public_id);

                if (thumbnailUrl) {
                    lecture.thumbnail.secure_url = thumbnailUrl;
                }
            }
        }

        result.lectures.push(lecture)
        result.numberOfLectures = result.lectures.length

        await result.save()

        res.status(200).json({
            success: true,
            message: "lecture created successfully",
            result
        })
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        })
    }
}


const updateLectureByCourseId = async (req, res) => {
    try {
        const { courseId, lectureNumber } = req.params
        const { title, description } = req.body

        if (!(title || description || req.file)) {
            throw new Error("Atleast one update you have to do")
        }

        const course = await Course.findById(courseId)

        if (!course) {
            throw new Error("This course does not exist")
        }

        if (!lectureNumber || lectureNumber < 1) {
            throw new Error("This lecture does not exist")
        }

        if (course.lectures.length < lectureNumber) {
            throw new Error("This lecture does not exist")
        }

        const targetLecture = course.lectures[lectureNumber - 1]

        if (title) {
            targetLecture.title = title
        }
        if (description) {
            targetLecture.description = description
        }
        if (req.file) {
            await cloudinary.v2.uploader.destroy(targetLecture.lecture.public_id)

            const uploadedVideo = await uploadLecture(req.file.buffer)

            if (uploadedVideo) {
                targetLecture.lecture.public_id = uploadedVideo.public_id
                targetLecture.lecture.secure_url = uploadedVideo.secure_url

                const thumbnailUrl = await createThumbnailFromRemoteVideo(uploadedVideo.public_id);

                if (thumbnailUrl) {
                    targetLecture.thumbnail.secure_url = thumbnailUrl;
                }
            }
        }

        await course.save()

        res.status(200).json({
            success: true,
            message: "lecture updated successfully",
            result: course
        })
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        })
    }
}


const deleteLectureByCourseId = async (req, res) => {
    try {
        const { courseId, lectureNumber } = req.params

        const result = await Course.findById(courseId)

        if (!result) {
            throw new Error("This course does not exist")
        }

        if (!lectureNumber) {
            throw new Error("Error: Please enter lecture number")
        }
        if (lectureNumber < 1) {
            throw new Error('Error: please enter valid number')
        }
        if (result.lectures.length < lectureNumber) {
            throw new Error(`Error: There are only ${result.lectures.length} lecture in this course`)
        }

        result.lectures.splice(lectureNumber - 1, 1)
        result.numberOfLectures = result.lectures.length

        result.save()

        res.status(200).json({
            success: true,
            message: "lecture deleted successfully",
            result
        })
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        })
    }
}


export { getLecturesByCourseId, createLectureByCourseId, updateLectureByCourseId, deleteLectureByCourseId }