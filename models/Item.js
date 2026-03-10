const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
    itCodigo:   {type: String, required: true},
    descricao:  {type: String, required: true}, 
    dataCriacao:{type: Date},
    situacao:   {type: String},     //Ativo; Obsoleto

    unit: {
        type:       mongoose.Schema.Types.ObjectId,
        ref:        "Unit",
        required:   true
    }
});

module.exports = mongoose.model("Item", itemSchema);