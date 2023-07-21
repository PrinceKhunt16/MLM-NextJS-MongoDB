import connectDB from "@/helper/connectDB"
import Coin from "@/models/coin"
import Package from "@/models/package"
import User from "@/models/user"
import Wallet from "@/models/wallet"
import PackageHistory from "@/models/packageHistory"
import jwt from "jsonwebtoken"
import { decode } from "@/utils/decode"
import { deleteCookie, getCookie } from "cookies-next"
import { decryptDocumentKey } from "@/utils/decryptDocumentKey"

export default async function (req, res) {
    await connectDB()

    if (req.method === "POST") {
        try {
            const { coinId, packageId } = JSON.parse(req.body)

            const cookie = getCookie(process.env.TOKEN_NAME, { req, res })

            if (!cookie) {
                return res.status(401).json({
                    message: "Unauthorized.",
                    success: false
                })
            }

            let token

            try {
                token = jwt.verify(decode(cookie), process.env.JWT_SECRET)
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

            const coin = await Coin.findById({ _id: decryptDocumentKey(coinId) })

            if (coin.status === 'deactive') {
                return res.status(409).json({
                    message: "Coin status deactive.",
                    success: false
                })
            }

            if (!coin) {
                return res.status(409).json({
                    message: "Coin not found.",
                    success: false
                })
            }

            const pack = await Package.findById({ _id: decryptDocumentKey(packageId) })

            if (pack.status === "deactive") {
                return res.status(409).json({
                    message: "Package status deactive.",
                    success: false
                })
            }

            if (!pack) {
                return res.status(409).json({
                    message: "Package not found.",
                    success: false
                })
            }

            const wallet = await Wallet.findOne({ userId: user._id, coinId: coin._id })

            let balanceToUsd = wallet.balance * coin.usdPrice

            if (balanceToUsd < pack.usdPrice) {
                return res.status(409).json({
                    message: "Insufficient balance.",
                    success: false
                })
            }

            const updatedBalance = wallet.balance - (pack.usdPrice / coin.usdPrice)

            await Wallet.findByIdAndUpdate({ _id: wallet._id }, { balance: updatedBalance })

            let referralUser

            if (user.referralFrom != '') {
                referralUser = await User.findOne({ referralCode: user.referralFrom })

                if (referralUser) {
                    const referralWallet = await Wallet.findOne({ userId: referralUser._id, coinId: coin._id })

                    const referralWalletBonus = ((pack.usdPrice / 100) * 5)

                    let referralWalletCoin

                    if (coin.usdPrice >= referralWalletBonus) {
                        referralWalletCoin = coin.usdPrice / referralWalletBonus
                    } else {
                        referralWalletCoin = referralWalletBonus / coin.usdPrice
                    }

                    await Wallet.findByIdAndUpdate({ _id: referralWallet._id }, { balance: Number(referralWallet.balance.toString()) + referralWalletCoin })
                }
            }

            const newPackageHistory = new PackageHistory({
                userId: user._id,
                coinId: coin._id,
                packageId: pack._id,
                usdPrice: pack.usdPrice,
                coinPrice: coin.usdPrice,
                createdOn: Date.now(),
                updatedOn: Date.now()
            })

            await newPackageHistory.save()

            return res.status(200).json({
                message: "Package bought successfully.",
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