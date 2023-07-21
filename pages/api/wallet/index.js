import connectDB from "@/helper/connectDB"
import Wallet from "@/models/Wallet"
import User from "@/models/User"
import jwt from "jsonwebtoken"
import mongoose from "mongoose"
import { deleteCookie } from "cookies-next"
import { decode } from "@/utils/decode"

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

            const response = await Wallet.aggregate([
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
                    $project:
                    {
                        _id: 0,
                        userId: 0,
                        coinId: 0,
                        coin: {
                            _id: 0,
                            status: 0,
                            createdOn: 0,
                            updatedOn: 0
                        },
                        updatedOn: 0
                    }
                }
            ])

            return res.status(200).json({
                message: "Package retrieved successfully.",
                success: true,
                data: response.map((res) => {
                    return {
                        ...res,
                        balance: res.balance.toString(),
                        coin: res.coin.map((c) => {
                            return {
                                ...c,
                                usdPrice: c.usdPrice.toString()
                            }
                        })
                    }
                })
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