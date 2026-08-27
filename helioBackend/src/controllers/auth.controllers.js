import User from "../models/User.models.js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

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

        await User.create({
            name, 
            email,
            password : hashedPassword,
            role: "patient"
        })

        return res.status(201).json({
            message: "User registered successfully"
        })

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

        const accesstoken = jwt.sign(
            {
                id: doesExist._id,
                name: doesExist.name,
                email: doesExist.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "15m"
            }
        )

        const refreshToken = jwt.sign(
            {
                id: doesExist._id
            },
            process.env.REFRESH_JWT_SECRET,
            {
                expiresIn: "7d"
            }
        )

        return res.status(200).json({
            message: "Login Successful",
            accesstoken,
            refreshToken
        })

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

    const accessToken = jwt.sign(
        {
            id: decoded.id
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "15m"
        }
    )

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