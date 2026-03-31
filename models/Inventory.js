const mongoose = require("mongoose")

const inventorySchema = new mongoose.Schema({
    empresa: {
        type:       mongoose.Schema.Types.ObjectId,
        ref:        "Company",
    },
    dataInventario: { type: Date,   required: true},
    descricao:      { type: String, required: true},
    tipoInventario: { type: String, required: true},    // Total, Parcial
    situacao:       { type: String, required:true},     //Criado, Em Processo, Finalizado Contagem
    dataCriacao:    { type: Date},
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

module.exports = mongoose.model("Inventory", inventorySchema);