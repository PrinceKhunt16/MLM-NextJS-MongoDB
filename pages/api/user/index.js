import connectDB from "@/helper/connectDB"
import User from "@/models/user"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import { decode } from "@/utils/decode"

export default async function (req, res) {
    await connectDB()

    if (req.method === "GET") {
        try {
            if (!req.headers.authorization) {
                return res.status(401).json({
                    message: "Unauthorized.",
                    success: false
                })
            }

            const { id: userId } = jwt.verify(decode(req.headers.authorization.split(" ")[1]), process.env.JWT_SECRET)

            const user = await User.findById({ _id: userId }).select('-_id -password -updatedAt')

            if (!user) {
                return res.status(401).json({
                    message: "Unvalid user credentials.",
                    success: false
                })
            }

            return res.status(200).json({
                message: "Got user detail successfully.",
                success: true,
                data: { ...user._doc, type: user.type.toString(), status: user.status.toString() }
            })
        } catch (error) {
            return res.status(500).json({
                message: "Internal server error.",
                err: error,
                success: false
            })
        }
    } else if (req.method === "PATCH") {
        try {
            if (!req.headers.authorization) {
                return res.status(401).json({
                    message: "Unauthorized.",
                    success: false
                })
            }

            const token = decode(req.headers.authorization.split(" ")[1])

            const { id: userId } = jwt.verify(token, process.env.JWT_SECRET)

            const user = await User.findById(userId)

            if (!user) {
                return res.status(404).json({
                    message: "User not found.",
                    success: false
                })
            }

            let hashedPassword

            if (req.body.oldPassword !== "") {
                const match = await bcrypt.compare(req.body.oldPassword, user.password)

                if (!match) {
                    return res.status(401).json({
                        message: "Unvalid old password.",
                        success: false
                    })
                }

                hashedPassword = await bcrypt.hash(req.body.newPassword, 10)
            }

            await User.findByIdAndUpdate({ _id: userId }, {
                firstName: req.body.firstname,
                lastName: req.body.lastname,
                avatar: req.body.avatar,
                password: hashedPassword ? hashedPassword : user.password
            })

            return res.status(200).json({
                message: "User details edit successfully.",
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