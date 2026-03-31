const mongoose = require("mongoose")

const datesItemBalanceSchema = new mongoose.Schema({
    empresa: {
        type:       mongoose.Schema.Types.ObjectId,
        ref:        "Company",
    },
    item: {
        type:       mongoose.Schema.Types.ObjectId,
        ref:        "Item",
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

module.exports = mongoose.model("DatesItemBalance", datesItemBalanceSchema)