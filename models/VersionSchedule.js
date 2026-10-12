const mongoose = require("mongoose");

const versionScheduleSchema = new mongoose.Schema({
    dataAtivacao:       { type: Date },
    usuarioAtivacao:    {
                            type:       mongoose.Schema.Types.ObjectId,
                            ref:        "User",
                        },
    eventos: [{
        empresa:    {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: 'Company'
                    },
        usuario:    {
                        type:       mongoose.Schema.Types.ObjectId,
                        ref:        "User",
                    },
        tipoEvento: {
                        type:       mongoose.Schema.Types.ObjectId,
                        ref:        "TypeEvent",
                    },
        dia:        { type: Date}

    }]

});

module.exports = mongoose.model("VersionSchedule", versionScheduleSchema);