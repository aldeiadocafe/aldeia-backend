const mongoose = require("mongoose");

const unitSchema = new mongoose.Schema({
    unidade:    {type: String,  required: true},
    descricao:  {type: String,  required: true}
});

module.exports = mongoose.model("Unit", unitSchema);