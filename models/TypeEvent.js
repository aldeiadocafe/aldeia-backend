const mongoose = require("mongoose");

const typeEventSchema = new mongoose.Schema({
    tipoEvento:         { type: String,     required: true },
    cor:                { type: String,     required: true },
    calcularDespesa:    { type: Boolean,    required: false},

});

module.exports = mongoose.model("TypeEvent", typeEventSchema);
