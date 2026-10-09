const mongoose = require("mongoose");

const draftScheduleSchema = new mongoose.Schema({
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
    dia:        { type: Date},
});

module.exports = mongoose.model("DraftSchedule", draftScheduleSchema);