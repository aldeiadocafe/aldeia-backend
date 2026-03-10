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
    quantidade:     { type: Number, required: true},
})

module.exports = mongoose.model("CountPlaces", countPlacesSchema)