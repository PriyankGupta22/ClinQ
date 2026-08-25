import mongoose from "mongoose"

const connectDataBase = async () => {
    try{
        await mongoose.connect(`${process.env.MONGODB_URI}`)
        console.log("Database connected")
    }
    catch(error){
        console.log("Error in database connection in db.js function connectDataBase", error.message)
        process.exit(1)
    }
}

export default connectDataBase;