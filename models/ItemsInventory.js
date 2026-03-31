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
    dataCriacao:{type: Date},
    usuarioCriacao: {
        type:       mongoose.Schema.Types.ObjectId,
        ref:        "User",
    },
    dataAlteracao:{type: Date},
    usuarioAlteracao: {
        type:       mongoose.Schema.Types.ObjectId,
        ref:        "User",
    },
})

module.exports = mongoose.model("ItemsInventory", itemsInventorySchema)