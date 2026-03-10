const express = require("express");
const router = express.Router();

const Unit = require("../models/Unit");
const Item = require("../models/Item");
const ConversationsItem = require("../models/ConversationsItem");

//Criar Item
router.post("/", async(req, res) => {

    const unit = await Unit.findById(req.body.unit);
    if (!unit) return res.status(404).json({message: "Unidade inválida!"});

    //Verifica se o Item já foi cadastrado
    const { codigo, ean } = req.body; // Pega os parâmetros da URL
    const filter = {};

    if (codigo) {

        filter.codigo = codigo

        const codVerifica = await ConversationsItem.find(filter);
        if(codVerifica.length != 0) return res.status(404).send("Código de Item já cadastrado!");

    }

    if (ean) { 

        filter.ean = ean
        const codVerifica = await ConversationsItem.find(filter);
        if(codVerifica.length != 0) return res.status(404).send("Código EAN já cadastrado!");

    }

    let conversations = new ConversationsItem({
        codigo:         req.body.codigo.toUpperCase(),
        descricao:      req.body.descricao.toUpperCase(),
        fator:          req.body.fator,
        dataCriacao:    new Date(),
        situacao:       'ATIVO',
        item,
        unit
    });

    conversations = await conversations.save();

    if(!conversations) return res.status(400).send("Item Conversão não pode ser criado!");

    res.send(conversations);

});

//Listar Itens
router.get('/', async(req, res) => {
    //res.status(200).send("chegou em itens");

    const { itCodigo, codigo, ean } = req.body
    const filter = {}

    if (itCodigo)   filter.itCodigo = itCodigo
    if (codigo)     filter.codigo   = codigo
    if (ean)        filter.ean      = ean

    const itemList = await Item.find(fitler)
                               .sort({descricao: 1})
                               .populate("item")
                               .populate("unit");

    if(!itemList) {
        res.status(500).json({success: false});
    };

    res.status(200).send(itemList);

});

//Listar Item especifico
router.get("/:id", async (req, res) => {
    const conversation = await ConversationsItem.findById(req.params.id)
                            .populate("item")
                            .populate("unit");

    if (!conversation) {
        res.status(404).json({message: "Item Conversão com Id não encontrado."});        
    };
    res.status(200).send(conversation);
});

//Alterar Item
router.put("/:id", async(req, res) => {

    const conversation = await ConversationsItem.findByIdAndUpdate(req.params.id,
        {
            item:           req.body.item,
            unit:           req.body.unit,
            codigo:         req.body.codigo.toUpperCase(),
            descricao:      req.body.descricao.toUpperCase(),
            ean:            req.body.ean.toUpperCase(),
            fator:          req.body.fator,
            dataCriacao:    req.body.dataCriacao,
            situacao:       req.body.situacao.toUpperCase(),
        },
        {new: true}
    );

    if (!conversation) {
        return res.status(400).send("O item de conversão não pode ser atualizado!");
    }

    res.send(conversation);

});

//Eliminar Item
router.delete("/:id", (req, res) => {
    ConversationsItem.findByIdAndDelete(req.params.id)
        .then((conversation) => {
            if (conversation){
                return res.status(200).json({
                    success: true,
                    message: "Item de Conversão eliminado!"
                });
            } else {
                return res.status(404).json({
                    success: false,
                    message: "Item de Conversão não localizado!"
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