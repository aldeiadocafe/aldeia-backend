const mongoose = require("mongoose");

const safetyStockSchema = new mongoose.Schema({
    empresa:            {
                            type: mongoose.Schema.Types.ObjectId,
                            ref: 'Company'
                        },
    item:               {
                            type:       mongoose.Schema.Types.ObjectId,
                            ref:        "Item",
                            required:   true
                        },
    quantidadeMinima:   { type: Number, required: true},
    dataCriacao:        {type: Date},
    usuarioCriacao:     {
                            type:       mongoose.Schema.Types.ObjectId,
                            ref:        "User",
                        },
    dataCriacao:        {type: Date},
    usuarioCriacao:     {
                            type:       mongoose.Schema.Types.ObjectId,
                            ref:        "User",
                        },

});

module.exports = mongoose.model("SafetyStock", safetyStockSchema);