const mongoose = require("mongoose");

const unitCostSchema = new mongoose.Schema({
    empresa:            {
                            type: mongoose.Schema.Types.ObjectId,
                            ref: 'Company',
                            required:   true
                        },
    item:               {
                            type:       mongoose.Schema.Types.ObjectId,
                            ref:        "Item",
                            required:   true
                        },
    custoUnitario:      { type: Number, required: true},
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

    dataAlteracao:        {type: Date},
    usuarioAlteracao:     {
                            type:       mongoose.Schema.Types.ObjectId,
                            ref:        "User",
                        },
});

module.exports = mongoose.model("UnitCost", unitCostSchema);