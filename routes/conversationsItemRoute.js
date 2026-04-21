const express = require("express");
const router = express.Router();

const Unit = require("../models/Unit");
const Item = require("../models/Item");
const ConversationsItem = require("../models/ConversationsItem");

//Criar Item
router.post("/", async(req, res) => {

    const item = await Item.findById(req.body.item);
    if (!item) return res.status(404).json({message: "Item inválido!"});

    const unitConversao = await Unit.findById(req.body.unitConversao);
    if (!unitConversao) return res.status(404).json({message: "Unidade de Conversão inválida!"});

    //Verifica se o Item já foi cadastrado
    const { ean } = req.body; // Pega os parâmetros da URL

    if (ean) { 

        const codVerifica = await ConversationsItem.find({ean: ean});
        if(codVerifica.length != 0) return res.status(404).send("Código EAN já cadastrado!");

    }

    let conversations = new ConversationsItem({
        item:           req.body.item,
        unitConversao:  unitConversao,
        ean:            req.body.ean.toUpperCase(),
        fator:          req.body.fator,
        usuarioCriacao: req.body.usuarioCriacao,
        dataCriacao:    new Date(),
        situacao:       'ATIVO',
    });

    conversations = await conversations.save();

    if(!conversations) return res.status(400).send("Item Conversão não pode ser criado!");

    res.send(conversations);

});

//Listar Itens
router.get('/', async(req, res) => {
    //res.status(200).send("chegou em itens");

    const { item, itCodigo, codigo, ean } = req.query
    const filter = {}

    if (item)       filter.item     = item
    if (codigo)     filter.codigo   = codigo
    if (ean)        filter.ean      = ean

    if (itCodigo) {
        const itemObj = await Item.findOne ({itCodigo: itCodigo.toUpperCase()})
        filter.item = itemObj ?  itemObj._id : null
    }

    const itemList = await ConversationsItem.find(filter)                                
                               .populate({
                                    path: "item",
                                    populate: { path: "unit", model: "Unit"}
                                })
                               .populate("unitConversao")
                               .sort({ 'item.descricao': 1 });


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