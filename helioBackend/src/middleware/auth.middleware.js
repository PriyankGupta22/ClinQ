import jwt from "jsonwebtoken"

const authMiddleWare = (req, res, next) => {
    try{
        const authHeader = req.headers.authorization;

        if(!authHeader){
            return res.status(400).json({
                message: "No authHeader in the request header"
            })
        }

        const token = authHeader.split(" ")[1]

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        )

        req.user = decoded

        next()
    }
    catch(error){
        return res.status(400).json({
            message: "Invalid token."
        })
    }
}

export default authMiddleWare;