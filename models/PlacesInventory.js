const mongoose = require("mongoose")

const placesInventorySchema = new mongoose.Schema({
    local:          { type: String, required: true},
    situacao:       { type: String, required:true},     //Criado, Em Processo, Finalizado Contagem

    inventory: {
        type:       mongoose.Schema.Types.ObjectId,
        ref:        "Inventory",
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

})

module.exports = mongoose.model("PlacesInventory", placesInventorySchema);