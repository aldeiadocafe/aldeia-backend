const express = require("express");
const router = express.Router();

const mongoose = require("mongoose")

const StockBalance  = require("../models/StockBalance")

// Criar
router.post("/", async(req, res) => {

    let stockBalance = new StockBalance({
        item:               req.body.item,
        quantidade:         req.body.quantidade,
        gcomEstoque:        req.body.gcomEstoque ? req.body.gcomEstoque : 0,
        dataGCom:           req.body.dataGCom ? req.body.dataGCom : null
    });

    if (req.body.inventory) {

        const dtInventario = Inventory.findById(req.body.inventory)

        if (dtInventario) {
            stockBalance.dataInventario = new Date(dtInventario).toISOString().split('T')[0]
            stockBalance.inventory      = req.body.inventory
        }
    }

    //Verificar se já existe Item
    const filter = {};      
    filter.item = stockBalance.item

    const itemVerifica = await StockBalance.find(filter);
    if(itemVerifica.length > 0 ) {

        return res.status(404).send("Item já cadastrado!");

    } 

    stockBalance = await stockBalance.save();

    if(!stockBalance) return res.status(400).send("Saldo Estoque não pode ser criado!");

    res.send(stockBalance);

});

//Atualizar GCom Estoque
router.post("/gcomestoque", async(req, res) => {

    const items = req.body  // Array: [{_id, gcomEstoque}]

    try {

        //Cria um array de operações
        const operations = items.map( item => ({
            updateOne: {
                filter: { _id: new mongoose.Types.ObjectId(item._id)},
                update: { $set: { 
                    gcomEstoque: item.gcomEstoque,
                    dataGCom: new Date()
                }}
            }
        }))

        // Executa as operações em massa
        await StockBalance.bulkWrite(operations)

        return res.status(200).json({ 
                success: true,
                message: 'Atualizado quantidade GCom'
            });

    } catch (error) {

        return res.status(404).json({ 
                success: false,
                message: 'Erro ao atualizar quantidade GCom'
            });

    }

})

router.get('/', async(req, res) => {
    
    const { item } = req.query; // Pega os parâmetros da URL
    
    const filter = {};
    
    if (item) filter.item = item

    const stockBalanceList = await StockBalance.find(filter)
                                         .populate([
                                            { path: 'empresa' },
                                            { path: 'item' },
                                        ])
                                         .sort({item: 1});

    if(stockBalanceList.length == 0) {

        return res.status(404).json({message: "Item Saldo não localizado!"});        

    };

    return res.status(200).send(stockBalanceList);

});

router.get("/:id", async (req, res) => {

    const stockBalance = await StockBalance.findById(req.params.id)
                                         .populate([
                                            { path: 'empresa' },
                                            { path: 'item' },
                                        ])


    if (!stockBalance) {
        return res.status(404).json({message: "Item com Id não encontrado."});        
    };
    return res.status(200).send(stockBalance);

});

router.put("/:id", async(req, res) => {

    let dtInventario
    if (req.body.inventory) {

        dtInventario = Inventory.findById(req.body.inventory)

        if (dtInventario) {
            stockBalance.dataInventario = new Date(dtInventario).toISOString().split('T')[0]
            stockBalance.inventory      = req.body.inventory
        }
    }

    const stockBalance = await StockBalance.findByIdAndUpdate(
        req.params.id,
        {   $set: {                             // Atualiza apenas um campo
                quantidade:     req.body.quantidade,
                gcom:           req.body.gcom ? req.body.gcom : 0,
                dataInventario: dtInventario ? new Date(dtInventario).toISOString().split('T')[0] : null,
                inventory:      req.body.inventory ? req.body.inventory : null
            }
        },
        {new: true, runValidators: true }    // RunValidators garante validação do schema
    );

    if (!stockBalance) {        
        return res.status(400).send("Item não pode ser atualizado!");
    }

    return res.send(stockBalance);

});

router.delete("/:id", async (req, res) => {

    StockBalance.findByIdAndDelete(req.params.id)
        .then((stockBalance) => {
            if (stockBalance){
                return res.status(200).json({
                    success: true,
                    message: "Item eliminado!"
                });
            } else {
                return res.status(404).json({
                    success: false,
                    message: "Inventário não localizado!"
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