import cloudinary from 'cloudinary'
import { Readable } from 'stream'


const uploadLecture = (fileBuffer) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.v2.uploader.upload_stream({
                folder: 'lms',
                chunk_size: 50000000,
                resource_type: 'video',
            },
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        );

        Readable.from(fileBuffer).pipe(stream);
    });
};

export default uploadLecture 