const mongoose = require("mongoose");

const companySchema = new mongoose.Schema({
    cnpj:               { type: String, required: true },
    nome:               { type: String, required: true },
    razaoSocial:        { type: String, required: true },
    inscricaoEstadual:  { type: String },
    endereco:           { type: String, required: true },
    numero:             { type: String },
    complemento:        { type: String },
    bairro:             { type: String },
    municipio:          { type: String },
    estado:             { type: String },
    cep:                { type: String },
    email:              { type: String },
    telefone:           { type: String }
});

module.exports = mongoose.model("Company", companySchema);