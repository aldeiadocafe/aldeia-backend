const mongoose = require("mongoose")

const datesItemSchema = new mongoose.Schema({
    itemsInventory: {
        type:       mongoose.Schema.Types.ObjectId,
        ref:        "ItemsInventory",
        required:   true
    },
    dataValidade:   { type: Date,   required: true},
    quantidade:     { type: Number, required: true},
})

module.exports = mongoose.model("DatesItemsInventory", datesItemSchema)