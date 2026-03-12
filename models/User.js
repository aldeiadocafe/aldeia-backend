const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    email:      { type: String, required: true },
    nome:       { type: String, required: true },
    senha:      { type: String, required: true },
    telefone:   { type: String },
    situacao:   { type: String, required: true},    //Ativo, Inativo
    companys: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company'
    }]
});

module.exports = mongoose.model("User", userSchema);