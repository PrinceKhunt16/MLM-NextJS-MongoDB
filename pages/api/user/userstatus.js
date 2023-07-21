import connectDB from "@/helper/connectDB"
import User from "@/models/user"
import jwt from "jsonwebtoken"
import { decode } from "@/utils/decode"

export default async function (req, res) {
    await connectDB()

    if (req.method === "PATCH") {
        try {
            if (!req.headers.authorization) {
                return res.status(401).json({
                    message: "Unauthorized.",
                    success: false
                })
            }

            const { id: userId } = jwt.verify(decode(req.headers.authorization.split(" ")[1]), process.env.JWT_SECRET)

            const user = await User.findById({ _id: userId })

            if (!user) {
                return res.status(401).json({
                    message: "Unvalid user credentials.",
                    success: false
                })
            }

            if (user.type === "user") {
                return res.status(401).json({
                    message: "Unauthorized.",
                    success: false
                })
            }

            await User.findOneAndUpdate({ email: req.body.email }, { status: req.body.status }, { new: true })

            return res.status(200).json({
                message: "User status change successfully.",
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