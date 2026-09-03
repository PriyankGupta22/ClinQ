import bcrypt from "bcryptjs"
import Clinic from "../models/Clinic.model.js"
import jwt from "jsonwebtoken"

export const clinicRegister = async (req, res) => {
    try{
        const {clinicName, email, password, phone, address, description} = req.body

        if(!clinicName || !email || !password || !phone || !description || !address){
            return res.status(400).json({
                message: "fill all  the fields"
            })
        }

        const clinicExists = await Clinic.findOne({ email })

        if(clinicExists){
           return res.status(400).json({
                message: "User with this email already exists try with another email or just login with the same email"
            }) 
        }

        const encodedPassword = await bcrypt.hash(password, 12)

        await Clinic.create(
            {
                clinicName: clinicName,
                email: email,
                password: encodedPassword,
                role: "clinicAdmin",
                phone: phone,
                address: address,
                description: description,
                isActive: true
            }
        )

        return res.status(201).json({
            message: "Clinic Registered Successfully"
        })
    }
    catch(error){
        console.log("Error while registering in clinicAuth.controllers.js file", error)
        return res.status(500).json({
            message: "Error while registering in clinicAuth.controllers.js file"
        })
    }
}


export const clinicLogin = async (req, res) => {
    try{
        const {email, password} = req.body

        if(!email || !password){
            return res.status(400).json({
                message: "fill all  the fields"
            })
        }

        const doesExist = await Clinic.findOne({ email })

        if(!doesExist){
           return res.status(400).json({
                message: "User with this email does not exists register first"
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
                clinicName: doesExist.clinicName,
                email: doesExist.email,
                role: doesExist.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "15m"
            }
        )

        const refreshToken = jwt.sign(
            {
                id: doesExist._id,
            },
            process.env.REFRESH_JWT_SECRET,
            {
                expiresIn: "7d"
            }
        )

        return res.status(200).json({
            message: "Clinic Login Successful",
            accesstoken,
            refreshToken
        })
    }
    catch(error){
        console.log("Error while logging in clinicAuth.controllers.js file", error)
        return res.status(500).json({
            message: "Error while logging in clinicAuth.controllers.js file"
        })
    }
}


export const clinicRefreshAccessToken = (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(401).json({
                message: "No refresh token present"
            });
        }

        const decoded = jwt.verify(
            refreshToken,
            process.env.REFRESH_JWT_TOKEN
        );

        const accessToken = jwt.sign(
            {
                id: decoded.id,
                role: "clinicAdmin"
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "15m"
            }
        );

        return res.status(200).json({
            message: "New clinic access token generated successfully",
            accessToken
        });
    }
    catch (error) {
        console.log(
            "Error while generating clinic access token",
            error
        );

        return res.status(401).json({
            message: "Invalid or expired refresh token"
        });
    }
};


export const clinicMe = (req, res) => {
    return res.status(200).json({
        id: req.clinic.id,
        clinicName: req.clinic.clinicName,
        email: req.clinic.email,
        role: req.clinic.role
    });
};