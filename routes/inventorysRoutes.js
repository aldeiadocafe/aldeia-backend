const express = require("express");
const router = express.Router();

const mongoose = require("mongoose")

const Inventory         = require("../models/Inventory");
const PlacesInventory   = require("../models/PlacesInventory")
const CountPlaces       = require("../models/CountPlaces");
const StockBalance = require("../models/StockBalance");
const DatesItemBalance = require("../models/DatesItemBalance");
const ItemsInventory = require("../models/ItemsInventory");
const DatesItemInventory = require("../models/DatesItemInventory");

// Criar
router.post("/", async(req, res) => {

    const dtInventario = new Date(req.body.dataInventario).toISOString().split('T')[0]
    
    let inventory = new Inventory({
        dataInventario: dtInventario,
        descricao:      req.body.descricao.toUpperCase(),
        tipoInventario: req.body.tipoInventario.toUpperCase(),
        situacao:       req.body.situacao.toUpperCase(),
        dataCriacao:    new Date(),
    });

    //Verificar se já existe Inventario
    const filter = {};     

    if (inventory.dataInventario && inventory.tipoInventario == 'TOTAL') {

        filter.dataInventario  = inventory.dataInventario
        filter.tipoInventario = inventory.tipoInventario

        const inventVerifica = await Inventory.find(filter);
        if(inventVerifica.length > 0 ) {

            return res.status(404).send("Existe Inventário/Total com essa data!");

        } 

    }

    inventory = await inventory.save();

    if(!inventory) return res.status(400).send("O Inventário não pode ser criado!");

    res.send(inventory);

});

//Finalizar Inventário
router.post("/finalizar/:id", async(req, res) => {

    const inventoryId = req.params.id

    const inventory = await Inventory.findById(inventoryId)
    if (!inventory) {
        return res.status(404).json({message: "Inventário não localizado!"})
    }

    //Pesquisar Local
    const places = await PlacesInventory.findOne({
        inventory: inventoryId,
    })
    if (!places) {
        return res.status(404).json({message: "Inventário sem localização!"})
    } 

    const placesDifFin = await PlacesInventory.findOne({
        inventory: inventoryId,
        situacao: {$ne: "FINALIZADO"}
    })
    if (placesDifFin) {
        return res.status(404).json({message: "Existe Localização não FINALIZADA!"})
    } 
        
    const countPlaces = await CountPlaces.findOne({
        placesInventory: places._id
    })
    if (!countPlaces) {
        return res.status(404).json({message: "Nenhum contagem localizada para esse inventário!"})
    }

    //Iniciar sessao
    const session = await mongoose.startSession()
    
    //Iniciar Transacao
    session.startTransaction()

    try {

        //Atualizar as tabelas de Estoque

        const itemsInv      = await ItemsInventory.find({inventory: inventoryId})
        if (itemsInv.length == 0 ) {
            return res.status(404).json({message: "Nenhum item localizado para esse inventário!"})
        }

        //Convertendo objetos de array, para uma lista
        const itemsInventoryId = itemsInv.map(item => item._id )

        // Busca todos os filhos onde o campo 'parent' está no array recebido
        const datesItemInv = await DatesItemInventory.find({ itemsInventory: { $in: itemsInventoryId } })
                                            .populate('itemsInventory');
        if (datesItemInv.length == 0 ) {
            return res.status(404).json({message: "Nenhum Item/Data Validade localizado para esse inventário!"})
        }

        //Caso seja inventário total
        if (inventory.tipoInventario === 'TOTAL') {
            
            // Filtro vacío {} elimina todo en la colección
            await StockBalance.deleteMany({},     {session});             
            await DatesItemBalance.deleteMany({}, {session});

        } else {
            const itemsInvId = itemsInv.map(item => item.item )

            // Usando $in para deletar documentos onde o _id está no array
            await StockBalance.deleteMany({ item: { $in: itemsInvId }}, {session});            
            await DatesItemBalance.deleteMany({ item: { $in: itemsInvId }}, {session});            

        }

        //Atribui campos como um array de objetos ({ })
        const stockAtualiz = itemsInv.map(item => ({
            item:           item.item,
            quantidade:     item.quantidade,
            inventory:      inventory ? inventory : null,
            dataInventario: inventory ? new Date(inventory.dataInventario).toISOString().split('T')[0] : null
        }))

        const dateItemsAtualiz = datesItemInv.map(cont => ({
            item:           cont.itemsInventory.item._id,
            dataValidade:   cont.dataValidade,
            quantidade:     cont.quantidade
        }))

        const resultado = await StockBalance.insertMany(stockAtualiz, {session})

        await DatesItemBalance.insertMany(dateItemsAtualiz, {session})

        await Inventory.findByIdAndUpdate(
            inventoryId,
            {   $set: {                             // Atualiza apenas um campo
                    situacao: 'FINALIZADO'
                }
            },
            {session, new: true, runValidators: true }    // RunValidators garante validação do schema
        );


        // Salvar todas as operações
        await session.commitTransaction();
        return res.status(200).send(resultado)

//        await session.abortTransaction()
//        return res.status(200).send("teste")

    } catch (error) {

        console.log(error)

        //Abortar
        await session.abortTransaction()

        res.status(400).send("Não foi possível finalizar Inventário")

    } finally {

        //Finalizar a sessao
        session.endSession()
    }

})

/*
    const contItem = await PlacesInventory.aggregate([

        {$match: {inventory: new mongoose.Types.ObjectId(inventoryId)}},

        //1. Unir com a tabela filho
        {
            $lookup: {
                from:           "countplaces",    // Nome da coleção no MongoDB
                localField:     "_id",
                foreignField:   "placesInventory",
                as:             "contagens"
            }
        },

        //2. Opcional: Desconstruir o array para facilitar o grupo
//        { $unwind: { path: '$contagens', preserveNullAndEmptyArrays: true}},
        { $unwind: '$contagens' },

        //3. Agrupar e Totalizar
        {
            $group: {
                _id: {  //Agrupor por campos
                    item:           "$contagens.item",
                },
                totalQuantidade:    { $sum: "$contagens.quantidade"}
            }
        }
    ])

    //Agrupando por Item / Data de Validade
    const contDateItem = await PlacesInventory.aggregate([

        {$match: {inventory: new mongoose.Types.ObjectId(inventoryId)}},

        //1. Unir com a tabela filho
        {
            $lookup: {
                from:           "countplaces",    // Nome da coleção no MongoDB
                localField:     "_id",
                foreignField:   "placesInventory",
                as:             "contagens"
            }
        },

        { $unwind: '$contagens' },

        //3. Agrupar e Totalizar
        {
            $group: {
                _id: {  //Agrupor por campos
                    item:           "$contagens.item",
                    dataValidade:   "$contagens.dataValidade"
                },
                totalQuantidade:    { $sum: "$contagens.quantidade"}
            }
        }

    ])    

*/

router.get('/', async(req, res) => {
    
    const { dataInventario, tipoInventario } = req.query; // Pega os parâmetros da URL
    
    const filter = {};
    

    if (dataInventario) {

        const dtInventario = new Date(dataInventario).toISOString().split('T')[0]
        filter.dataInventario = dtInventario

    } 

    if (tipoInventario)
        filter.tipoInventario = tipoInventario

    const inventoryList = await Inventory.find(filter)
                                         .sort({dataInventario: 1,
                                                tipoInventario: 1
                                         });


    if(inventoryList.length == 0) {

        if (dataInventario) {
            return res.status(404).json({message: "Inventário não localizado!"});        
        }

        return res.status(500).json({success: false});
    };

    return res.status(200).send(inventoryList);

});

router.get("/:id", async (req, res) => {

    const inventory = await Inventory.findById(req.params.id);

    if (!inventory) {
        return res.status(404).json({message: "Inventário com Id não encontrado."});        
    };
    return res.status(200).send(inventory);

});

router.put("/:id", async(req, res) => {
    
    const dtInventario = new Date(req.body.dataInventario).toISOString().split('T')[0]
    const tpInventario = req.body.tipoInventario.toUpperCase()
    const _id = req.body._id

    //Mudando para TOTAL
    const filter = {};      

    if (dtInventario && tpInventario == 'TOTAL') {

        filter.dataInventario  = dtInventario
        filter.tipoInventario = tpInventario
        filter._id = { $ne: _id }

        const inventVerifica = await Inventory.find(filter);
        if(inventVerifica.length > 0) {

            return res.status(404).send("Existe Inventário/Total com essa data!");

        } 

    }
    
    const inventory = await Inventory.findByIdAndUpdate(req.params.id,
        {
            dataInventario: dtInventario,
            descricao:      req.body.descricao.toUpperCase(),
            tipoInventario: req.body.tipoInventario.toUpperCase(),
            situacao:       req.body.situacao.toUpperCase()
        },
        {new: true}
    );

    if (!inventory) {        
        return res.status(400).send("O Inventário não pode ser atualizado!");
    }

    return res.send(inventory);

});

router.delete("/:id", async (req, res) => {

    const placesVerifica = await PlacesInventory.find({inventory: req.params.id});
    if (placesVerifica.length >0 ) return res.status(404).send('Existe Local relacionado ao Inventário!');


    Inventory.findByIdAndDelete(req.params.id)
        .then((inventory) => {
            if (inventory){
                return res.status(200).json({
                    success: true,
                    message: "Inventário eliminado!"
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