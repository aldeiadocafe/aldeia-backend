const mongoose = require("mongoose")

const inventorySchema = new mongoose.Schema({
    dataInventario: { type: Date,   required: true},
    descricao:      { type: String, required: true},
    tipoInventario: { type: String, required: true},    // Total, Parcial
    situacao:       { type: String, required:true},     //Criado, Em Processo, Finalizado Contagem
    dataCriacao:    { type: Date}
})

module.exports = mongoose.model("Inventory", inventorySchema);