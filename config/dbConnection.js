import mongoose from "mongoose" 

const dbConnection = async () => {
    try{
        const mongoUri = process.env.MONGO_URI
        const conn = await mongoose.connect(mongoUri)
        console.log("database connected on", conn.connection.host)
        return true
    }
    catch(error){
        console.log("database connection failed", error) 
        process.exit(1)
    }
}

export default dbConnection 