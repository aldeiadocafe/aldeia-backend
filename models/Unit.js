const mongoose = require("mongoose");

const unitSchema = new mongoose.Schema({
    unidade:    {type: String,  required: true},
    descricao:  {type: String,  required: true},
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

module.exports = mongoose.model("Unit", unitSchema);