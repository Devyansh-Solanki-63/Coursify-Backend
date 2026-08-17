import app from "./app.js"
import cloudinary from "cloudinary"
import Razorpay from "razorpay"

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

const PORT = process.env.PORT || 8000

if(process.env.PROD != "true"){
    app.listen(PORT, () => {
        console.log(`app is running on http://localhost:${PORT}`)
    })
}


export default razorpay