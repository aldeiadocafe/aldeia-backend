const mongoose = require("mongoose")

const datesItemBalanceSchema = new mongoose.Schema({
    item: {
        type:       mongoose.Schema.Types.ObjectId,
        ref:        "Item",
        required:   true
    },
    dataValidade:   { type: Date,   required: true},
    quantidade:     { type: Number, required: true},
})

module.exports = mongoose.model("DatesItemBalance", datesItemBalanceSchema)