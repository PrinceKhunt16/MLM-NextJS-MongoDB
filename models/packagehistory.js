import mongoose, { model, models, Schema } from "mongoose"

const packageHistorySchema = new Schema(
    {
        userId: {
            type: mongoose.Types.ObjectId,
            required: true
        },
        coinId: {
            type: mongoose.Types.ObjectId,
            required: true
        },
        packageId: {
            type: mongoose.Types.ObjectId,
            required: true
        },
        usdPrice: {
            type: String,
            required: true
        },
        coinPrice: {
            type: String,
            required: true
        },
        createdOn: {
            type: String,
            required: true
        }
    },
    {
        versionKey: false
    }
)

export default models.PackageHistory || model("PackageHistory", packageHistorySchema)