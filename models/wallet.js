import mongoose, { model, models, Schema } from "mongoose"

const walletSchema = new Schema(
    {
        userId: {
            type: mongoose.Types.ObjectId,
            required: true
        },
        coinId: {
            type: mongoose.Types.ObjectId,
            required: true
        },
        balance: {
            type: mongoose.Types.Decimal128,
            required: true
        },
        createdOn: {
            type: String,
            required: true
        },
        updatedOn: {
            type: String,
            required: true
        }
    },
    {
        versionKey: false
    }
)

export default models.Wallet || model("Wallet", walletSchema)