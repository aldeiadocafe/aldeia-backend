const mongoose = require("mongoose");

const typeEventSchema = new mongoose.Schema({
    tipoEvento:         { type: String,     required: true },
    cor:                { type: String,     required: true },
    calcularDespesa:    { type: Boolean },
    ativo:              { type: Boolean },

});

module.exports = mongoose.model("TypeEvent", typeEventSchema);
