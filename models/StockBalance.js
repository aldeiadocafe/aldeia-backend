const mongoose = require("mongoose")

const stockBalanceSchema = new mongoose.Schema({
    item: {
        type:       mongoose.Schema.Types.ObjectId,
        ref:        "Item",
        required:   true
    },
    quantidade:     { type: Number, required: true},
    gcomEstoque:    { type: Number},
    dataInventario: { type: Date },
    inventory: {
        type:       mongoose.Schema.Types.ObjectId,
        ref:        "Inventory",
    }

})

module.exports = mongoose.model("StockBalance", stockBalanceSchema)