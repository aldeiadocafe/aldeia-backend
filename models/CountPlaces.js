const mongoose = require("mongoose")

const countPlacesSchema = new mongoose.Schema({
    placesInventory: {
        type:       mongoose.Schema.Types.ObjectId,
        ref:        "PlacesInventory",
        required:   true
    },
    item: {
        type:       mongoose.Schema.Types.ObjectId,
        ref:        "Item",
        required:   true
    },
    dataValidade:   { type: Date,   required: true},
    quantidade:     { type: Number},
    zerar:          { type: Boolean},
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

module.exports = mongoose.model("CountPlaces", countPlacesSchema)