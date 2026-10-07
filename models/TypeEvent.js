const mongoose = require("mongoose");

const typeEventSchema = new mongoose.Schema({
    tipo:   { type: String, required: true },
    cor:    { type: String, required: true },
});

module.exports = mongoose.model("TypeEvent", typeEventSchema);