const mongoose = require("mongoose")

const datesItemSchema = new mongoose.Schema({
    itemsInventory: {
        type:       mongoose.Schema.Types.ObjectId,
        ref:        "ItemsInventory",
        required:   true
    },
    dataValidade:   { type: Date,   required: true},
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

module.exports = mongoose.model("DatesItemsInventory", datesItemSchema)