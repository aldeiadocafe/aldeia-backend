const mongoose = require("mongoose")

const itemsNfeSchema = new mongoose.Schema({

    nfe: {
        type:       mongoose.Schema.Types.ObjectId,
        ref:        "NFe",
        required:   true
    },
    nItem:          { type: Number, required: true },
    codigo:         { type: String, required: true },
    descricao:      { type: String, required: true },
    quantidade:     { type: Number, required: true },
    valorUnitario:  { type: Number, required: true },
    valorTotal:     { type: Number, required: true }
    
})

module.exports = mongoose.model("ItemsNfe", itemsNfeSchema)