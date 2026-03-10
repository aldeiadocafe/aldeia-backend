const express = require("express");
const router = express.Router();

const Unit = require("../models/Unit");
const { connectDB } = require("../db/connectDB");

// Criar Unidade
router.post("/", async(req, res) => {

    await connectDB()

    let unit = new Unit({
        unidade:    req.body.unidade,
        descricao:  req.body.descricao
    });

    //Verificar se já existe a unidade
    const unitVerifica = await Unit.find({unidade: req.body.unidade});
    if(unitVerifica.length != 0) return res.status(404).send("Unidade já cadastrada!");

    unit = await unit.save();

    if(!unit) return res.status(400).send("A unidade não pode ser criada!");

    res.send(unit);

});

router.get('/', async(req, res) => {

    await connectDB()

    const { unidade, descricao } = req.query; // Pega os parâmetros da URL
    const filter = {};

    if (unidade)    filter.unidade = unidade;
    if (descricao)  filter.descriao= descricao;
    
    const unitList = await Unit.find(filter)
                            .sort({unidade: 1});

    if(unitList.length === 0) {

        if (unidade) {
            return res.status(404).json({message: "Unidade não encontrada."});        
        }

        return res.status(500).json({success: false});
    };

    return res.status(200).send(unitList);

});

router.get("/:id", async (req, res) => {

    await connectDB()
    const unit = await Unit.findById(req.params.id);

    if (!unit) {
        return res.status(404).json({message: "Unidade com Id não encontrado."});        
    };
    return res.status(200).send(unit);

});

router.put("/:id", async(req, res) => {

    await connectDB()
    const unit = await Unit.findByIdAndUpdate(req.params.id,
        {
            unidade:    req.body.unidade,
            descricao:  req.body.descricao
        },
        {new: true}
    );

    if (!unit) {
        return res.status(400).send("A unidade não pode ser atualizada!");
    }

    return res.send(unit);

});

router.delete("/:id", (req, res) => {

    Unit.findByIdAndDelete(req.params.id)
        .then((unit) => {
            if (unit){
                return res.status(200).json({
                    success: true,
                    message: "Unidade eliminada!"
                });
            } else {
                return res.status(404).json({
                    success: false,
                    message: "Unidade não localizada!"
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