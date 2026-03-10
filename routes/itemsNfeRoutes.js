const express = require("express");
const router = express.Router();

const mongoose = require("mongoose");

const ItemsNfe = require("../models/ItemsNfe");
const Nfe = require("../models/Nfe");

//Criar registro
router.post("/", async (req, res) => {

    const nfe = await Nfe.findById(req.body.nfe);
    if (!nfe) return res.status(404).send('Nota Fiscal inválida!');

    let itemsNfe = new ItemsNfe({
        nfe:            req.body.nfe,
        nItem:          req.body.nItem,
        codigo:         req.body.codigo,
        descricao:      req.body.descricao,  
        quantidade:     req.body.quantidade,  
        valorUnitario:  req.body.valorUnitario,
        valorTotal:     req.body.valorTotal
    })

    itemsNfe = await itemsNfe.save();

    if(!itemsNfe) return res.status(400).send("Item da Nota Fiscal não pode ser criada!");

    res.send(itemsNfe);

})

router.post("/allitemsnfe", async (req, res) => {

    const items = req.body

    try {

        await ItemsNfe.insertMany(items)

        return res.status(200).json({ 
                success: true,
                message: 'Itens de Nota criados com sucesso'
            });


    } catch (error) {

        return res.status(404).json({ 
                success: false,
                message: 'Erro ao atualizar quantidade GCom'
            });

    }

})

router.get('/', async(req, res) => {
    
    const { itemsNfe } = req.query; // Pega os parâmetros da URL

    const filter = {};
    if(itemsNfe) {
        filter.itemsNfe = itemsNfe
    }  

    const itemsNfeList = await ItemsNfe.find(filter)
                                .populate("nfe")
                                .sort({nItem: 1})

    if (itemsNfeList.length === 0) {
        return res.status(404).json({message: "Item de Nota Fiscal não encontrado!"})
    }

    return res.status(200).send(itemsNfeList)
    
})

router.get("/:id", async (req, res) => {
    
    const itemsNfe = await ItemsNfe.findById(req.params.id);

    if (!itemsNfe) {
        return res.status(404).json({message: "Item de Nota Fiscal com Id não encontrado!"})        
    }

    return res.status(200).send(itemsNfe);

})


router.put("/:id", async(req, res) => {

    const itemsNfe = await ItemsNfe.findByIdAndUpdate(req.params.id,
        {
            nfe:            req.body.nfe,
            nItem:          req.body.nItem,
            codigo:         req.body.codigo,
            descricao:      req.body.descricao,  
            quantidade:     req.body.quantidade,  
            valorUnitario:  req.body.valorUnitario,
            valorTotal:     req.body.valorTotal
        },
        {new: true}
    );

    if (!itemsNfe) {
        return res.status(400).send("Item de Nota Fiscal não pode ser atualizada!");
    }

    return res.send(itemsNfe);

});


router.delete("/:id", async (req, res) => {

    ItemsNfe.findByIdAndDelete(req.params.id)
        .then((items) => {
            if (items){
                return res.status(200).json({
                    success: true,
                    message: "Item de Nota Fiscal eliminada!"
                });
            } else {
                return res.status(404).json({
                    success: false,
                    message: "Item de Nota Fiscal não localizada!"
                });
            }
        }).catch((err) => {
            return res.status(500).json({
                success: false,
                error: err
            });
        });

})

module.exports = router;