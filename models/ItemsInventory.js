const mongoose = require("mongoose")

const itemsInventorySchema = new mongoose.Schema({
    inventory: {
        type:       mongoose.Schema.Types.ObjectId,
        ref:        "Inventory",
        required:   true,
    },
    item: {
        type:       mongoose.Schema.Types.ObjectId,
        ref:        "Item",
        required:   true
    },
    quantidade:     { type: Number, required: true},
})

module.exports = mongoose.model("ItemsInventory", itemsInventorySchema)