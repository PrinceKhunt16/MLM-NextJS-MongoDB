import connectDB from "@/helper/connectDB"
import PackageHistory from "@/models/packageHistory"
import User from "@/models/user"
import jwt from "jsonwebtoken"
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

            const { id: userId } = jwt.verify(decode(req.headers.authorization.split(" ")[1]), process.env.JWT_SECRET)

            const user = await User.findById({ _id: userId }).select('-_id -password -updatedAt')

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

            const response = await PackageHistory.aggregate([
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

            const pages = Math.ceil(await PackageHistory.count() / req.body.documents)

            return res.status(200).json({
                message: "Got users data successfully.",
                success: true,
                pages: pages,
                data: response
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