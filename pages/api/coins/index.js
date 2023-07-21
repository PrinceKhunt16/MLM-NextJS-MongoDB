import connectDB from "@/helper/connectDB"
import Coin from "@/models/coin"
import User from "@/models/user"
import Wallet from "@/models/wallet"
import jwt from "jsonwebtoken"
import { deleteCookie } from "cookies-next"
import { encryptDocumentKey } from "@/utils/encryptDocumentKey"
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

            const coin = await Coin.findOne({
                $or: [
                    { name: req.body.name },
                    { ticker: req.body.ticker }
                ]
            })

            if (coin) {
                return res.status(409).json({
                    message: "Coin already exists.",
                    success: false
                })
            }

            const newCoin = new Coin({
                name: req.body.name,
                ticker: req.body.ticker,
                logo: req.body.logo,
                usdPrice: req.body.usdPrice,
                status: req.body.status,
                createdOn: Date.now(),
                updatedOn: Date.now()
            })

            await newCoin.save()

            const users = await User.find()

            const wallet = []

            users.forEach((user) => {
                wallet.push({
                    userId: user.id,
                    coinId: newCoin.id,
                    balance: 100,
                    createdOn: Date.now(),
                    updatedOn: Date.now()
                })
            })

            await Wallet.insertMany(wallet)

            return res.status(200).json({
                message: "Coin created successfully.",
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
            const coins = await Coin.find().select('-updatedOn')

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
                message: "Coins retrieved successfully.",
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