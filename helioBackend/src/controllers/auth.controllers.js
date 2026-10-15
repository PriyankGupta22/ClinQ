import User from "../models/User.models.js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

const issueTokens = (user) => ({
    accessToken: jwt.sign({ id: user._id, name: user.name, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: "15m" }),
    refreshToken: jwt.sign({ id: user._id, role: user.role }, process.env.REFRESH_JWT_SECRET, { expiresIn: "7d" })
})

export const registerUser = async (req, res) => {
    try{
        const {name, email, password} = req.body
        if(!name || !email || !password){
            return res.status(400).json({
                message: "fill all  the fields"
            })
        }
        
        const existingUser = await User.findOne({email})

        if(existingUser){
            return res.status(400).json({
                message: "User with this email already exists try with another email or just login with the same email"
            })
        }
        
        const hashedPassword = await bcrypt.hash(password, 12)

        const user = await User.create({
            name, 
            email,
            password : hashedPassword,
            role: "patient"
        })

        return res.status(201).json({ message: "User registered successfully", ...issueTokens(user), user: { id: user._id, name: user.name, email: user.email, role: user.role } })

    }
    catch(error){
        console.log("Error while registering in auth.controllers.js file", error)
        return res.status(500).json({
            message: "Error while registering in auth.controllers.js file"
        })
    }
}

export const loginUser = async (req, res) => {
    try{
        const {email, password} = req.body

        if(!email || !password){
            return res.status(400).json({
                message: "fill all  the fields"
            })
        }

        const doesExist = await User.findOne({ email })

        if(!doesExist){
            return res.status(400).json({
                message: "User does not exists please register first"
            })
        }

        const isPasswordCorrect = await bcrypt.compare(password, doesExist.password)

        if(!isPasswordCorrect){
            return res.status(400).json({
                message: "Wrong password. Try again."
            })
        }

        return res.status(200).json({ message: "Login Successful", ...issueTokens(doesExist), user: { id: doesExist._id, name: doesExist.name, email: doesExist.email, role: doesExist.role } })

    }
    catch(error){
        console.log("error in login in loginUser function in auth.controllers.js", error)
        return res.status(500).json({
            message: "error in login in loginUser function in auth.controllers.js"
        })
    }
}

export const refreshAccessToken = (req, res) => {

    try{
        const {refreshToken} = req.body

    if(!refreshToken){
        return res.status(401).json({
            message: "no refresh token present"
        })
    }

    const decoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_JWT_SECRET
    )

    const accessToken = jwt.sign({ id: decoded.id, role: decoded.role || "patient" }, process.env.JWT_SECRET, { expiresIn: "95m" })

    return res.status(200).json({
        message: "Generated access from refresh tokens successfully",
        accessToken
    })

    }
    catch(error){
        return res.status(401).json({
            message: "Error in generating access from refresh tokens"
        })
    }
}


export const getMe = (req, res) => {
    try{
        const { id, name, email} = req.user
        return res.status(200).json({
            id: id,
            name: name,
            email: email,
            message: "details above"
        })
    }
    catch(error){
        console.log("some error in getMe function in authMiddleware", error)
        return res.status(401).json({
            message: "some error in getMe function in authMiddleware"
        })
    }
}
