const express = require("express");
const router = express.Router();

const mongoose = require("mongoose")

const Safety    = require("../models/safetyStock");
const Company   = require("../models/Company");
const Item      = require("../models/Item");

// Criar
router.post("/", async(req, res) => {
    
    let safetyStock = new Safety({
        empresa:            req.body.empresa,
        item:               req.body.item,
        quantidadeMinima:   req.body.quantidadeMinima,
        usuarioCriacao:     req.body.usuarioCriacao,
        dataCriacao:        new Date()
    });

    //  Verificar se existe Empresa
    const empresa = await Company.findById(safetyStock.empresa)
    if (!empresa) return res.status(404).send("Empresa não localizada!")

    //  Verificar se existe Item
    const item = await Item.findById(safetyStock.item)
    if (!item) return res.status(404).send("Item não localizado!")

    //Iniciar sessao
    const session = await mongoose.startSession()

    //Iniciar Transacao
    session.startTransaction()

    try {

        safetyStock = await safetyStock.save();
        if(!safetyStock) return res.status(400).send("Estoque de Segurança/Empresa não pode ser criado!");

        res.send(safetyStock);

    } catch (error) {

        console.log(error)

        //Abortar
        await session.abortTransaction()

        res.status(400).send("Não foi possível gravar Estoque de Segurança/Empresa")

    }

});

router.get("/:id", async (req, res) => {

    const safety = await Safety.findById(req.params.id)
                                            .populate([
                                                    { path: "empresa" },
                                                    { path: "item" },
                                                    { path: 'usuarioCriacao',   select: 'nome email'},
                                                    { path: 'usuarioAlteracao', select: 'nome email'}
                                                ])
                                            .sort({item: 1,
                                                   empresa: 1});

    if (!safety) {
        return res.status(404).json({message: "Estoque de Segurança com Id não encontrado."});        
    };
    return res.status(200).send(safety);

});

router.get('/', async(req, res) => {
    
    const { empresa, item } = req.query; // Pega os parâmetros da URL
    
    const filter = {};

    if ( empresa )    filter.empresa    = empresa
    if ( item     )    filter.item       = item

    let safetyStockList = await SafetyStock
                                        .find(filter)
                                        .populate([
                                            { path: "empresa" },
                                            { path: "item" },
                                            { path: 'usuarioCriacao',   select: 'nome email'},
                                            { path: 'usuarioAlteracao', select: 'nome email'}
                                        ])
                                        .sort({item: 1,
                                                empresa: 1});


    if(safetyStockList.length == 0) {

        return res.status(404).json({message: "Estoque de Segurança não localizado!"});        

    };

    return res.status(200).send(safetyStockList);

});

router.put("/:id", async(req, res) => {
    
    const safety = await SafetyStock.findByIdAndUpdate(req.params.id,
        {
            quantidadeMinima:   req.body.quantidadeMinima,
            dataAlteracao:      new Date(),
            usuarioAlteracao:   req.body.usuarioAlteracao
        },
        {new: true}
    );

    if (!safety) {        
        return res.status(400).send("Estoque de Segurança não pode ser atualizado!");
    }

    return res.send(safety);

});

router.delete("/:id", async (req, res) => {

    SafetyStock.findByIdAndDelete(req.params.id)
        .then((safetyStock) => {
            if (safetyStock){
                return res.status(200).json({
                    success: true,
                    message: "Estoque de Segurança eliminado!"
                });
            } else {
                return res.status(404).json({
                    success: false,
                    message: "Estoque de Segurança não localizado!"
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