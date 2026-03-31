const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
    itCodigo:   {type: String, required: true},
    descricao:  {type: String, required: true}, 
    situacao:   {type: String},     //Ativo; Obsoleto

    unit: {
        type:       mongoose.Schema.Types.ObjectId,
        ref:        "Unit",
        required:   true
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

    quantidadeMinima: { type: Number },

});

module.exports = mongoose.model("Item", itemSchema);