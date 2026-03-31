const mongoose = require("mongoose")

const stockBalanceSchema = new mongoose.Schema({
    empresa: {
        type:       mongoose.Schema.Types.ObjectId,
        ref:        "Company",
    },
    item: {
        type:       mongoose.Schema.Types.ObjectId,
        ref:        "Item",
        required:   true
    },
    quantidade:     { type: Number, required: true},
    gcomEstoque:    { type: Number},
    dataGCom:       { type: Date },
    dataInventario: { type: Date },
    inventory: {
        type:       mongoose.Schema.Types.ObjectId,
        ref:        "Inventory",
    },
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

module.exports = mongoose.model("StockBalance", stockBalanceSchema)