const express = require("express");
const router = express.Router();

const mongoose = require("mongoose");

const Inventory = require("../models/Inventory");
const ItemsInventory = require("../models/ItemsInventory")
const Item = require("../models/Item");
const PlacesInventory = require("../models/PlacesInventory");

//Criar registro
router.post("/", async (req, res) => {

    const inventory = await Inventory.findById(req.body.inventory);
    if (!inventory) return res.status(404).send('Inventário Inválido!');

    const item = await Item.findById(req.body.item);
    if (!item) return res.status(404).send('Item Inválido!');

    // Verifica se já existe para esse item
    const filter = {}
    filter.inventory = req.body.inventory

    if (item) filter.item = req.body.item

    const itemsInventoryList = await ItemsInventory.find(filter)

    if (itemsInventoryList.length > 0) 
        return res.status(404).json({message: "Já existe Item de Inventário!"})

    let itemsInventory = new ItemsInventory({
        inventory,
        item,
        quantidade:     req.body.quantidade,
    })

    itemsInventory = await itemsInventory.save();

    if (!itemsInventory) return res.status(400).send("Não foi possível criar Item do Inventário!");

    res.send(itemsInventory);    

})

router.get('/', async(req, res) => {
    
    const { inventory, item } = req.query; // Pega os parâmetros da URL
    
    const filter = {};

    if ( inventory )    filter.inventory = inventory
    if ( item )         filter.item      = item

    const itemsInventoryList = await ItemsInventory.find(filter)
                                .populate("inventory")
                                .populate("item")
                                .sort({inventory: 1,
                                       item: 1
                                })

    if (itemsInventoryList.length === 0) {
        return res.status(404).json({message: "Item Inventário não encontrado!"})
    }

    return res.status(200).send(itemsInventoryList)
    
})

router.get("/:id", async (req, res) => {
    
    const itemsInventory = await ItemsInventory.findById(req.params.id);

    if (!itemsInventory) {
        return res.status(404).json({message: "Item Inventário com Id não encontrado!"})        
    }

    return res.status(200).send(itemsInventory);

})

//Alterar
router.put("/:id", async(req, res) => {

    const itemsInventory = await ItemsInventory.findByIdAndUpdate(
        req.params.id,
        {   $set: {                             // Atualiza apenas um campo
                quantidade: req.body.quantidade
            }
        },
        {new: true, runValidators: true }    // RunValidators garante validação do schema
    );

    if (!itemsInventory) {
        return res.status(400).send("O Item Inventário não pode ser atualizado!");
    }

    res.send(itemsInventory);


});

router.delete("/:id", async (req, res) => {

    ItemsInventory.findByIdAndDelete(req.params.id)
        .then((itemsInventory) => {
            if (itemsInventory){
                return res.status(200).json({
                    success: true,
                    message: "Item de Inventário eliminado!"
                });
            } else {
                return res.status(404).json({
                    success: false,
                    message: "Item de Inventário não localizado!"
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