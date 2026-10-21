const express = require("express");
const router = express.Router();
const { default: mongoose } = require("mongoose");

const { connectDB } = require("../db/connectDB");
const Schedule = require("../models/Schedule")
const VersionSchedule = require("../models/VersionSchedule");
const Company = require("../models/Company");
const User = require("../models/User");
const TypeEvent = require("../models/TypeEvent");

router.get('/', async(req, res) => {

    await connectDB()

    const { dataAtivacao, usuario } = req.query; // Pega os parâmetros da URL
    const filter = {};

    if (usuario)    filter.usuario      = usuario;

    if (dataAtivacao) {

        const dtAtivacao = new Date(dataAtivacao).toISOString().split('T')[0]
        filter.dataAtivacao = dtAtivacao
    }
    
    const versionList = await VersionSchedule.find(filter)
                                    .sort({dataAtivacao: -1});

    if(versionList.length === 0) {

        return res.status(404).json({message: "Versão de Escala não encontrada."});

    };

    return res.status(200).send(versionList);

});

router.get("/:id", async (req, res) => {

    await connectDB()
    const draft = await VersionSchedule.findById(req.params.id)

    if (!draft) {
        return res.status(404).json({message: "Versão de Escala com Id não encontrado."});        
    };
    return res.status(200).send(draft);

});

module.exports = router;