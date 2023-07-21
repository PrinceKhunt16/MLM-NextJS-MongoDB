import connectDB from "@/helper/connectDB"
import User from "@/models/user"
import PackageHistory from "@/models/packageHistory"
import jwt from "jsonwebtoken"
import mongoose from "mongoose"
import { decode } from "@/utils/decode"
import { deleteCookie } from "cookies-next"

export default async function (req, res) {
    await connectDB()

    if (req.method === 'POST') {
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

            const response = await PackageHistory.aggregate([
                {
                    $match:
                    {
                        userId: new mongoose.Types.ObjectId(user.id)
                    }
                },
                {
                    $lookup:
                    {
                        from: "coins",
                        localField: "coinId",
                        foreignField: "_id",
                        as: "coin"
                    }
                },
                {
                    $lookup:
                    {
                        from: "packages",
                        localField: "packageId",
                        foreignField: "_id",
                        as: "package"
                    }
                },
                {
                    $lookup:
                    {
                        from: "users",
                        localField: "userId",
                        foreignField: "_id",
                        as: "user"
                    }
                },
                {
                    $project:
                    {
                        _id: 0,
                        userId: 0,
                        coinId: 0,
                        packageId: 0,
                        coin: {
                            _id: 0,
                            usdPrice: 0,
                            status: 0,
                            createdOn: 0,
                            updatedOn: 0
                        },
                        package: {
                            _id: 0,
                            description: 0,
                            usdPrice: 0,
                            status: 0,
                            createdOn: 0,
                            updatedOn: 0
                        }
                    }
                },
                {
                    $sort:
                    {
                        createdOn: -1
                    }
                }
            ]).limit(JSON.parse(req.body).documents)

            const dataLength = await PackageHistory.aggregate([
                {
                    $match:
                    {
                        userId: new mongoose.Types.ObjectId(user.id)
                    }
                }
            ])

            return res.status(200).json({
                message: "Got package history successfully.",
                success: true,
                data: response,
                length: dataLength.length
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