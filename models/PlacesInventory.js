const mongoose = require("mongoose")

const placesInventorySchema = new mongoose.Schema({
    local:          { type: String, required: true},
    situacao:       { type: String, required:true},     //Criado, Em Processo, Finalizado Contagem
    dataCriacao:    { type: Date},

    inventory: {
        type:       mongoose.Schema.Types.ObjectId,
        ref:        "Inventory",
        required:   true
    },    
})

module.exports = mongoose.model("PlacesInventory", placesInventorySchema);