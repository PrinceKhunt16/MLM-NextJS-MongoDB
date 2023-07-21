import connectDB from "@/helper/connectDB"
import User from "@/models/user"
import jwt from "jsonwebtoken"
import { deleteCookie } from "cookies-next"
import { decode } from "@/utils/decode"

export default async function (req, res) {
    await connectDB()

    if (req.method === "POST") {
        try {
            if (!req.headers.authorization) {
                return res.status(401).json({
                    message: "Unauthorized.",
                    success: false
                })
            }

            let token

            try {
                token = jwt.verify(decode(req.headers.authorization.split(" ")[1]), process.env.JWT_SECRET)
            } catch (error) {
                deleteCookie(process.env.TOKEN_NAME, { req, res })

                return res.status(401).json({
                    message: "Unauthorized.",
                    success: false
                })
            }

            const user = await User.findById({ _id: token.id })

            if (!user || user.type === "user") {
                return res.status(401).json({
                    message: "User not found.",
                    success: false
                })
            }

            let users = []

            if (JSON.parse(req.body).status === "") {
                users = await User.find().select('-_id -updatedOn -password -referralFrom')
            } else {
                users = await User.find({ status: JSON.parse(req.body).status }).select('-_id -updatedOn -password -referralFrom')
            }

            return res.status(200).json({
                message: "Users filtered data retrieved successfully.",
                success: true,
                data: users.map((user) => {
                    return { ...user._doc, type: user.type.toString(), status: user.status.toString() }
                })
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
        message: "Method Not Allowed",
        success: false
    })
}