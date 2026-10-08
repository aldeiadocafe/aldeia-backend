const express = require("express");
const router = express.Router();

const TypeEvent = require("../models/TypeEvent");
const { connectDB } = require("../db/connectDB");

// Criar Unidade
router.post("/", async(req, res) => {

    await connectDB()

    let typeEvent = new TypeEvent({
        tipoEvento: req.body.tipoEvento.toUpperCase().trim(),
        cor:        req.body.cor,
    });

    //Verificar se já existe a unidade
    const typeEventVerifica = await TypeEvent.find({tipoEvento: req.body.tipoEvento});    
    if(typeEventVerifica.length != 0) return res.status(404).send("Tipo de Evento já cadastrado!");

    typeEvent = await typeEvent.save();

    if(!typeEvent) return res.status(400).send("Tipo de Evento não pode ser criado!");

    res.send(typeEvent);

//    res.send("teste1")
});

router.get('/', async(req, res) => {

    await connectDB()

    const { tipoEvento } = req.query; // Pega os parâmetros da URL
    const filter = {};

    if (tipoEvento) filter.tipoEvento = tipoEvento.toUpperCase().trim();
    
    const typeEventList = await TypeEvent.find(filter)

    if(typeEventList.length === 0) {

        return res.status(404).json({message: "Tipo de Evento não encontrado."});        

    };

    return res.status(200).send(typeEventList);

});

router.get("/:id", async (req, res) => {

    await connectDB()
    const typeEvent = await TypeEvent.findById(req.params.id)

    if (!typeEvent) {
        return res.status(404).json({message: "Tipo de Evento com Id não encontrado."});        
    };
    return res.status(200).send(typeEvent);

});

router.put("/:id", async(req, res) => {

    await connectDB()
    const typeEvent = await TypeEvent.findByIdAndUpdate(req.params.id,
        {
            tipoEvento: req.body.tipoEvento,
            cor:        req.body.cor,
        },
        {new: true}
    );

    if (!typeEvent) {
        return res.status(400).send("Tipo de Evento não pode ser atualizado!");
    }

    return res.send(typeEvent);

});

router.delete("/:id", (req, res) => {

    TypeEvent.findByIdAndDelete(req.params.id)
        .then((typeEvent) => {
            if (typeEvent){
                return res.status(200).json({
                    success: true,
                    message: "Tipo de Evento eliminado!"
                });
            } else {
                return res.status(404).json({
                    success: false,
                    message: "Tipo de Evento não localizado!"
                });
            }
        }).catch((err) => {
            return res.status(500).json({
                success: false,
                error: err
            });
        });
});

module.exports = router;