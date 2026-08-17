import mongoose from "mongoose" 
import bcrypt from "bcryptjs" 
import JWT from "jsonwebtoken" 
import crypto from "crypto" 

const userSchema = new mongoose.Schema({
    name: {
        type: "String",
        required: [true, "Name is required"],
        minLength: [3, "Name must have minimum 3 char"],
        maxLength: [30, "Name must have maximum 30 char"],
        lowercase: false,
        trim: true
    },
    email: {
        type: "String",
        required: [true, "Email is required"],
        unique: [true, "This email already exists"],
        lowercase: true,
        trim: true
    },
    password: {
        type: "String",
        select: false,
        required: [true, "Password is required"],
        minLength: [4, "Password must have minimum 4 char"]
    },
    avatar: {
        public_id: {type: "String"},
        secure_url: {type: "String"}
    },
    role: {
        type: "String",
        enum: ['USER', 'ADMIN'],
        default: 'USER'
    },
    forgotPasswordToken: {
        type: "String"
    },
    forgotPasswordExpiry: {
        type: "Date"
    },
    subscription: {
        id: "String",
        status: "String"
    }

}, {timestamps: true}) 


userSchema.pre('save', async function(next){
    if(this.isModified('password')){
        this.password = await bcrypt.hash(this.password, 10) 
        return next()
    }
    return next()
})


userSchema.methods = {
    generateJwtToken: function(){
        return JWT.sign(
            {id:this._id, email:this.email, subscription:this.subscription, role:this.role}, // payload
            process.env.JWT_SECRET,
            {expiresIn: '24h'}
        )
    },
    comparePassword: function(plainPassword){
        return bcrypt.compare(plainPassword, this.password) 
    },
    generateResetToken: function(){
        const resetToken = crypto.randomBytes(20).toString('hex')

        const encryptedToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex') 

        // changing database values
        this.forgotPasswordToken = encryptedToken 
        this.forgotPasswordExpiry = Date.now() + (5 * 60 * 1000)  // expires in 5 minutes

        return resetToken 
    }
}


export default mongoose.model("User", userSchema)