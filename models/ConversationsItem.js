const mongoose = require("mongoose")

const converstionsItemSchema = new mongoose.Schema({
    item: {
        type:       mongoose.Schema.Types.ObjectId,
        ref:        "Item",
        required:   true
    },
    unitConversao: {
        type:       mongoose.Schema.Types.ObjectId,
        ref:        "Unit",
        required:   true
    },
    ean:        { type: String },
    fator:      { type: Number, required: true },
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
    situacao:   {type: String},     //Ativo; Obsoleto

})

module.exports = mongoose.model("ConversationsItem", converstionsItemSchema)