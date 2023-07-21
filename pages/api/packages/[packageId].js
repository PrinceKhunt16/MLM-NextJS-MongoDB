import connectDB from "@/helper/connectDB"
import Package from "@/models/Package"
import jwt from "jsonwebtoken"
import User from "@/models/User"
import { decode } from "@/utils/decode"
import { decryptDocumentKey } from "@/utils/decryptDocumentKey"
import { encryptDocumentKey } from "@/utils/encryptDocumentKey"
import { deleteCookie } from "cookies-next"

export default async function (req, res) {
    await connectDB()

    if (req.method === 'GET') {
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

            if (!user) {
                return res.status(401).json({
                    message: "User not found.",
                    success: false
                })
            }

            const pack = await Package.findById(decryptDocumentKey(req.query.packageId))

            const data = {
                id: encryptDocumentKey(pack.id),
                name: pack.name,
                image: pack.image,
                description: pack.description,
                usdPrice: pack.usdPrice.toString(),
                status: pack.status.toString(),
                createdOn: pack.createdOn
            }

            return res.status(200).json({
                message: "Package retrieved successfully.",
                success: true,
                data
            })
        } catch (error) {
            return res.status(500).json({
                message: "Internal server error.",
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

            if (!user || user.type === "user") {
                return res.status(401).json({
                    message: "Unauthorized",
                    success: false
                })
            }

            await Package.findByIdAndUpdate({ _id: decryptDocumentKey(req.query.packageId) }, {
                name: req.body.name,
                description: req.body.description,
                image: req.body.image,
                usdPrice: req.body.usdPrice,
                status: req.body.status,
            })

            return res.status(200).json({
                message: "Coin details edit successfully.",
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