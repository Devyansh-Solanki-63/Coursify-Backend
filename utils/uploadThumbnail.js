import cloudinary from 'cloudinary'
import { Readable } from 'stream'


const uploadThumbnail = (fileBuffer) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.v2.uploader.upload_stream({ folder: 'lms' }, (error, result) => {
            if (error) return reject(error);
            resolve(result);
        });

        Readable.from(fileBuffer).pipe(stream);
    });
};

export default uploadThumbnail 