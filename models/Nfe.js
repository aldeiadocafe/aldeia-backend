const mongoose = require("mongoose")

const nfeSchema = new mongoose.Schema({

    chave:              { type: String, required: true },
    numero:             { type: String, required: true },
    serie:              { type: String, required: true },
    dataEmissao:        { type: Date,   required: true },
    aldeiaCnpj:         { type: String, required: true },
    emitCnpj:           { type: String, required: true },
    emitNome:           { type: String, required: true },
    infCpl:             { type: String },
    valorTotal:         { type: Number, required: true},
    transpCnpj:         { type: String },
    transpNome:         { type: String },
    transpVolEsp:       { type: String },
    transpVolnro:       { type: Number },
    transpPesoBruto:    { type: Number },
    transpPesoLiq:      { type: Number },
    transpVolQtde:      { type: Number }

})

module.exports = mongoose.model("NFe", nfeSchema)