import mongoose from 'mongoose' 

const courseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        minlength: [8, 'Title must be atleast 8 characters'],
        maxlength: [50, 'Title cannot be more than 50 characters'],
        trim: true,
    },
    description: {
        type: String,
        required: [true, 'Description is required']
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
    },
    lectures: [
        {
            title: String,
            description: String,
            lecture: {
                public_id: {
                    type: String,
                },
                secure_url: {
                    type: String,
                },
            },
            thumbnail: {
                public_id: {
                    type: String,
                },
                secure_url: {
                    type: String,
                },
            },
        },
    ],
    thumbnail: {
        public_id: {
            type: String,
        },
        secure_url: {
            type: String,
        },
    },
    numberOfLectures: {
        type: Number,
        default: 0,
    },
    createdBy: {
        type: String,
    }

}, {timestamps: true}) 



export default mongoose.model('Course', courseSchema) 