import connectDB from "@/helper/connectDB"
import Package from "@/models/package"
import User from "@/models/user"
import jwt from "jsonwebtoken"
import { deleteCookie } from "cookies-next"
import { decode } from "@/utils/decode"
import { encryptDocumentKey } from "@/utils/encryptDocumentKey"

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

            let pack = []

            if (JSON.parse(req.body).status === "") {
                pack = await Package.find().select('-updatedOn')
            } else {
                pack = await Package.find({ status: JSON.parse(req.body).status }).select('-updatedOn')
            }

            const data = pack.map((pack) => {
                return {
                    id: encryptDocumentKey(pack.id),
                    name: pack.name,
                    description: pack.description,
                    image: pack.image,
                    usdPrice: pack.usdPrice.toString(),
                    status: pack.status.toString(),
                    createdOn: pack.createdOn
                }
            })

            return res.status(200).json({
                message: "Packages filtered data retrieved successfully.",
                success: true,
                data
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