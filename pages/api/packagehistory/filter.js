import connectDB from "@/helper/connectDB"
import PackageHistory from "@/models/packageHistory"
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

            const data = await PackageHistory.aggregate([
                {
                    $match: {
                        createdOn: {
                            $gte: String(req.body.start),
                            $lte: String(req.body.end)
                        }
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
                            status: 0,
                            createdOn: 0,
                            updatedOn: 0
                        },
                        package: {
                            _id: 0,
                            description: 0,
                            status: 0,
                            createdOn: 0,
                            updatedOn: 0
                        },
                        user: {
                            _id: 0,
                            firstName: 0,
                            lastName: 0,
                            password: 0,
                            avatar: 0,
                            type: 0,
                            status: 0,
                            referralCode: 0,
                            referralFrom: 0,
                            createdOn: 0,
                            updatedOn: 0
                        },
                    }
                },
                {
                    $sort:
                    {
                        createdOn: -1
                    }
                }
            ]).skip(req.body.page * req.body.documents).limit(req.body.documents)

            const dataLength = await PackageHistory.aggregate([
                {
                    $match: {
                        createdOn: {
                            $gte: String(req.body.start),
                            $lte: String(req.body.end)
                        }
                    }
                }
            ])

            const pages = Math.ceil(dataLength.length / req.body.documents)

            return res.status(200).json({
                message: "Package history retrieved successfully.",
                success: true,
                data: data,
                pages: pages,
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