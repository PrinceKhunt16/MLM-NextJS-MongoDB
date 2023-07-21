import connectDB from "@/helper/connectDB"
import User from "@/models/user"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { setCookie } from "cookies-next"
import { encode } from "@/utils/encode"

export default async function (req, res) {
    await connectDB()

    if (req.method == "POST") {
        try {
            const user = await User.findOne({ email: req.body.email })

            if (!user) {
                return res.status(401).json({
                    message: "Unvalid user credentials.",
                    success: false
                })
            }

            const match = await bcrypt.compare(req.body.password, user.password)

            if (!match) {
                return res.status(401).json({
                    message: "Unvalid user credentials.",
                    success: false
                })
            }

            const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: 60 * 60 * 24 * 7 })

            setCookie(process.env.TOKEN_NAME, encode(token), { req, res })

            return res.status(200).json({
                message: "You logged in successfully.",
                success: true
            })
        } catch (error) {
            return res.status(500).json({
                message: "Internal server error.",
                err: error,
                success: false
            })
        }
    }

    return res.status(405).json({
        message: "Method not allowed.",
        success: false
    })
}