const mongoose = require("mongoose");

const shoppingSchema = new mongoose.Schema({
    empresas: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company'
    }],
    itCodigo:           {type: String,  required: true},
    quantidade:         { type: Number, required: true},
    dataSolicitacao:    {type: Date},
    usuarioSolicitacao: {
                            type:       mongoose.Schema.Types.ObjectId,
                            ref:        "User",
                        },
    dataCompra:         {type: Date},
    usuarioCompra:      {
                            type:       mongoose.Schema.Types.ObjectId,
                            ref:        "User",
                        },
    comprado:           {type: Boolean},
    eliminado:          {type: Boolean},
    dataEliminacao:     {type: Date},
    usuarioEliminacao:  {
                            type:       mongoose.Schema.Types.ObjectId,
                            ref:        "User",
                        },

});

module.exports = mongoose.model("Shopping", shoppingSchema);