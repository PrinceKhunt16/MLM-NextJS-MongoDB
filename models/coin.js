import mongoose, { model, models, Schema } from "mongoose"

const coinSchema = new Schema(
    {
        name: {
            type: String,
            unique: true,
            required: true
        },
        ticker: {
            type: String,
            unique: true,
            required: true
        },
        logo: {
            type: String,
            required: true
        },
        usdPrice: {
            type: mongoose.Types.Decimal128,
            required: true
        },
        status: {
            type: mongoose.Types.Decimal128,
            enum: [0, 1],
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

export default models.Coin || model("Coin", coinSchema)