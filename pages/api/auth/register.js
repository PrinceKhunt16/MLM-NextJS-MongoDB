import connectDB from "@/helper/connectDB"
import User from "@/models/user"
import Coin from "@/models/coin"
import Wallet from "@/models/wallet"
import bcrypt from "bcrypt"
import ShortUniqueId from "short-unique-id"

export default async function (req, res) {
    await connectDB()

    if (req.method === "POST") {
        try {
            const user = await User.findOne({ email: req.body.email })

            if (user) {
                return res.status(409).json({
                    message: "Email already exists.",
                    success: false
                })
            }

            const hashedPassword = await bcrypt.hash(req.body.password, 10)

            let check = true, refCode

            while (check) {
                refCode = new ShortUniqueId({ length: 6 })

                const refCodeExists = await User.exists({ refCode: refCode() })

                if (!refCodeExists) {
                    check = false
                }
            }

            const newUser = new User({
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email,
                password: hashedPassword,
                avatar: req.body.avatar,
                referralCode: refCode(),
                referralFrom: req.body.referralFrom,
                createdOn: Date.now(),
                updatedOn: Date.now()
            })

            await newUser.save()

            const coins = await Coin.find()

            const wallet = []

            coins.forEach((coin) => {
                wallet.push({
                    userId: newUser.id,
                    coinId: coin.id,
                    balance: 0,
                    createdOn: Date.now(),
                    updatedOn: Date.now()
                })
            })

            await Wallet.insertMany(wallet)

            return res.status(200).json({
                message: "Your account has been created.",
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
        message: "Method not allowed.",
        success: false
    })
}