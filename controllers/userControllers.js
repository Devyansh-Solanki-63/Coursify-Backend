import User from "../models/userModel.js"
import emailValidator from "email-validator"
import uploadAvatar from "../utils/uploadAvatar.js"
import sendEmail from "../utils/sendEmail.js"
import crypto from "crypto"
import cloudinary from "cloudinary"


const register = async (req, res) => {
    try{
        const {name, email, password} = req.body

        if(!name || !email || !password){
            throw new Error("all fields are mandetory")
        }
        const validEmail = emailValidator.validate(email)
        if(!validEmail){
            throw new Error("Invalid Email spotted")
        }
        const userExist = await User.findOne({email})
        if(userExist){
            throw new Error("This user already exists")
        }

        const result = await User.create({
            name,
            email,
            password,
            avatar: {
                public_id: email,
                secure_url: ''
            }
        })

        // Image file uploading in cloudinary
        if(req.file){
            const uploadedImage = await uploadAvatar(req.file.buffer) 

            result.avatar.public_id = uploadedImage.public_id
            result.avatar.secure_url = uploadedImage.secure_url

            await result.save()
        }

        // automatically logging-in user when he registers itself.
        const token = await result.generateJwtToken()
        result.password = undefined

        const cookieOption = {
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            secure: true,
            sameSite: process.env.PROD == "true" ? 'None' : 'Lax',
            httpOnly: true
        }

        res.cookie("token", token, cookieOption)


        res.status(200).json({
            success: true,
            message: "user registered successfully",
            result
        })
    }
    catch(e){
        res.status(400).json({
            success: false,
            message: e.message,
        })
    }
}


const login = async (req, res) => {
    try{
        const {email, password} = req.body

        if(!email || !password){
            throw new Error("all fields are mandetory")
        }

        const result = await User.findOne({email}).select('+password')
        if(result === null){
            throw new Error("user doesn't exist")
        }
        if(!await result.comparePassword(password)){
            throw new Error("Incorrect password")
        }

        const token = await result.generateJwtToken()
        result.password = undefined

        const cookieOption = {
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            secure: true,
            sameSite: process.env.PROD == "true" ? 'None' : 'Lax',
            httpOnly: true
        }

        res.cookie("token", token, cookieOption)

        res.status(200).json({
            success: true,
            message: "user logged-in successfully",
            user: result
        })
    }
    catch(e){
        res.status(400).json({
            success: false,
            message: e.message,
        })
    }
}


const logout = async (req, res) => {
    try{
        const cookieOption = {
            secure: true,
            expires: new Date(),
            sameSite: process.env.PROD == "true" ? 'None' : 'Lax',
            httpOnly: true
        }

        res.cookie("token", null, cookieOption) 

        res.status(200).json({
            success: true,
            message: "user logged-out successfully"
        })
    }
    catch(error){
        res.status(400).json({
            success: false,
            message: error.message
        })
    }
}


const profile = async (req, res) => {
    try{
        const userId = req.user.id 

        const user = await User.findById(userId)

        if(!user){
            throw new Error("This user no longer exist!")
        }

        res.status(200).json({
            success: true,
            message: "You are awesome",
            user
        })
    }
    catch(error){
        res.status(400).json({
            success: false,
            message: error.message
        })
    }
}


const checkLoginToken = async (req, res) => {
    try{
        const userId = req?.user?.id 

        if(!userId){
            throw new Error("You are not logged-in")
        }

        res.status(200).json({ success: true, data: req.user })
    }
    catch(error){
        res.status(400).json({
            success: false,
            message: error.message
        })
    }
}


const forgotPassword = async (req, res) => {
    try{
        const {email} = req.body

        if(!email){
            throw new Error("Email is required")
        }
        const result = await User.findOne({email})
        if(result === null){
            throw new Error("This email is not registered")
        }

        const resetToken = await result.generateResetToken()

        await result.save()

        const resetPasswordUrl = `http://localhost:5000/api/v1/user/reset/${resetToken}`

        try{
            const subject = "Reset Password"
            const message = `you can reset your password by clicking <a href=${resetPasswordUrl} target="_blank">Reset your password</a>`

            await sendEmail(email, subject, message)  // sending email

            console.log(resetToken) 

            res.status(200).json({
                success: true,
                message: `Reset password url has been sent to ${email}`
            })
        }
        catch(e){
            result.forgotPasswordToken = undefined
            result.forgotPasswordExpiry = undefined

            await result.save()

            res.status(400).json({
                success: false,
                message: `Reset password url couldn't send due to some issues ....... ${e.message}`
            })
        }
    }
    catch(error){
        res.status(400).json({
            success: false,
            message: error.message
        })
    }
}


const resetPassword = async (req, res) => {
    try{
        const {password} = req.body 
        const {resetToken} = req.params 

        if(!password){
            throw new Error("please enter your new password")
        }
        if(password.length < 4){
            throw new Error("password should have atleast 4 characters")
        }

        const encryptedToken = crypto.createHash('sha256').update(resetToken).digest('hex')

        const result = await User.findOne({
            forgotPasswordToken: encryptedToken,
            forgotPasswordExpiry: { $gt: Date.now() }
        })

        if(!result){
            throw new Error("This link is expired or Invalid.")
        }

        result.password = password
        result.forgotPasswordToken = undefined
        result.forgotPasswordExpiry = undefined

        await result.save()

        res.status(200).json({
            success: true,
            message: "password updated successfully",
        })
    }
    catch(error){
        res.status(400).json({
            success: false,
            message: error.message
        })
    }
}


const updateProfile = async (req, res) => {
    try{
        const {name} = req.body
        const {id} = req.user

        if(!name){
            throw new Error("please enter new name")
        }

        const result = await User.findById(id)

        result.name = name 

        if(req.file){
            await cloudinary.v2.uploader.destroy(result.avatar.public_id)  // removing existing image

            // new Image file uploading in cloudinary
            const uploadedImage = await uploadAvatar(req.file.buffer)

            result.avatar.public_id = uploadedImage.public_id
            result.avatar.secure_url = uploadedImage.secure_url
        }

        await result.save()

        res.status(200).json({
            success: true,
            message: "profile updated successfully",
            user: result
        })
    }
    catch(error){
        res.status(400).json({
            success: false,
            message: error.message
        })
    }
}


export {register, login, logout, profile, checkLoginToken, forgotPassword, resetPassword, updateProfile}