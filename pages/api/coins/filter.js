import connectDB from "@/helper/connectDB"
import Coin from "@/models/coin"
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

            let coins = []

            if (JSON.parse(req.body).status === "") {
                coins = await Coin.find().select('-updatedOn')
            } else {
                coins = await Coin.find({ status: JSON.parse(req.body).status }).select('-updatedOn')
            }

            const data = coins.map((coin) => {
                return {
                    id: encryptDocumentKey(coin.id),
                    name: coin.name,
                    logo: coin.logo,
                    ticker: coin.ticker,
                    usdPrice: coin.usdPrice.toString(),
                    status: coin.status.toString(),
                    createdOn: coin.createdOn
                }
            })

            return res.status(200).json({
                message: "Coins filtered data retrieved successfully.",
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