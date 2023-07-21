import connectDB from "@/helper/connectDB"
import Package from "@/models/package"
import User from "@/models/user"
import jwt from "jsonwebtoken"
import { encryptDocumentKey } from "@/utils/encryptDocumentKey"
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

            const pack = await Package.findOne({ name: req.body.name })

            if (pack) {
                return res.status(409).json({
                    message: "Package already exists.",
                    success: false
                })
            }

            const newPackage = new Package({
                name: req.body.name,
                image: req.body.image,
                description: req.body.description,
                usdPrice: req.body.usdPrice,
                status: req.body.status,
                createdOn: Date.now(),
                updatedOn: Date.now()
            })

            await newPackage.save()

            return res.status(200).json({
                message: "Package created successfully.",
                success: true
            })
        } catch (error) {
            return res.status(500).json({
                message: "Internal server error.",
                err: error,
                success: false
            })
        }
    } else if (req.method === 'GET') {
        try {
            const packages = await Package.find().select()

            const data = packages.map((pack) => {
                return {
                    id: encryptDocumentKey(pack.id),
                    name: pack.name,
                    image: pack.image,
                    description: pack.description,
                    usdPrice: pack.usdPrice.toString(),
                    status: pack.status.toString(),
                    createdOn: pack.createdOn,
                    updatedOn: pack.updatedOn
                }
            })

            return res.status(200).json({
                message: "Packages retrieved successfully.",
                success: true,
                data
            })
        } catch (error) {
            return res.status(500).json({
                message: "Internal server error.",
                success: false
            })
        }
    }

    return res.status(405).json({
        message: "Method Not Allowed",
        success: false
    })
}