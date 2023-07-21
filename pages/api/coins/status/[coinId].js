import connectDB from "@/helper/connectDB"
import Coin from "@/models/Coin"
import jwt from "jsonwebtoken"
import User from "@/models/User"
import { decryptDocumentKey } from "@/utils/decryptDocumentKey"
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

            const token = decode(req.headers.authorization.split(" ")[1])

            const { id: userId } = jwt.verify(token, process.env.JWT_SECRET)

            const user = await User.findById(userId)

            if (!user || user.type === "user") {
                return res.status(401).json({
                    message: "Unauthorized",
                    success: false
                })
            }

            await Coin.findByIdAndUpdate({ _id: decryptDocumentKey(req.query.coinId) }, {
                status: req.body.status,
            })

            return res.status(200).json({
                message: "Coin status edit successfully.",
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
        message: "Method Not Allowed",
        success: false
    })
}