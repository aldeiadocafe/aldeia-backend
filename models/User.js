const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    email:      { type: String, required: true },
    nome:       { type: String, required: true },
    senha:      { type: String, required: true },
    telefone:   { type: String },
    situacao:   { type: String, required: true},    //Ativo, Inativo
    empresas: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company'
    }],
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

});

module.exports = mongoose.model("User", userSchema);