const mongoose = require("mongoose")

const converstionsItemSchema = new mongoose.Schema({
    item: {
        type:       mongoose.Schema.Types.ObjectId,
        ref:        "Item",
        required:   true
    },
    unit: {
        type:       mongoose.Schema.Types.ObjectId,
        ref:        "Unit",
        required:   true
    },
    codigo:     { type: String },
    descricao:  { type: String, required: true },
    ean:        { type: String },
    fator:      { type: Number, required: true },
    dataCriacao:{type: Date},
    situacao:   {type: String},     //Ativo; Obsoleto

})

module.exports = mongoose.model("ConversationsItem", converstionsItemSchema)