const express = require("express");
const router = express.Router();

const mongoose = require("mongoose")

const Inventory = require("../models/Inventory");
const PlacesInventory = require("../models/PlacesInventory");
const CountPlaces = require("../models/CountPlaces");

// Criar
router.post("/", async(req, res) => {
    
    let placesInventory = new PlacesInventory({
        local:          req.body.local.toUpperCase(),
        situacao:       req.body.situacao.toUpperCase(),
        inventory:      req.body.inventory,
        dataCriacao:    new Date(),
    });

    //  Verificar se existe Inventory
    const inventory = await Inventory.findById(placesInventory.inventory)
    if (!inventory) return res.status(404).send("Inventário não localizado!")

    // Verifica se já existe Inventário/Local
    const filter = {}
    filter.inventory = placesInventory.inventory

    if (placesInventory.local) filter.local = placesInventory.local

    const placesList = await PlacesInventory.find(filter)
    if (placesList.length > 0)
        return res.status(404).json({message: "Inventário/Local já cadastrado"})

    //Iniciar sessao
    const session = await mongoose.startSession()

    //Iniciar Transacao
    session.startTransaction()

    try {

        placesInventory = await placesInventory.save();
        if(!placesInventory) return res.status(400).send("Inventário/Local não pode ser criado!");

        await Inventory.findByIdAndUpdate(
            placesInventory.inventory,
            {   $set: {                             // Atualiza apenas um campo
                    situacao: 'EM PROCESSO'
                }
            },
            {new: true, runValidators: true }    // RunValidators garante validação do schema
        );

        res.send(placesInventory);

    } catch (error) {

        console.log(error)

        //Abortar
        await session.abortTransaction()

        res.status(400).send("Não foi possível gravar Inventário/Local")

    }

});

//Finalizar Local
router.post("/finalizar/:id", async(req, res) => {

    const countPlaces = await CountPlaces.findOne({
        placesInventory: req.params.id
    })
    if (!countPlaces) {
        return res.status(404).json({message: "Nenhum contagem localizada para essa localização!"})
    }

    await PlacesInventory.findByIdAndUpdate(
        req.params.id,
        {   $set: {                             // Atualiza apenas um campo
                situacao: 'FINALIZADO'
            }
        },
        {new: true, runValidators: true }    // RunValidators garante validação do schema
    );

    return res.status(200).json({message: 'Localização finalizada com sucesso!'});

})

router.get('/', async(req, res) => {
    
    const { inventory, local, dataInventario } = req.query; // Pega os parâmetros da URL
    
    const filter = {};

    if ( inventory )    filter.inventory    = inventory
    if ( local     )    filter.local        = {$regex : local.toUpperCase()}; // Contem

    let placesInventoryList = await PlacesInventory
                                        .find(filter)
                                        .populate("inventory")
                                        .sort({inventory: 1,
                                               local: 1});


    if (dataInventario) {

        const dtInventario = new Date(dataInventario).toISOString().split('T')[0]
        placesInventoryList = placesInventoryList.filter(places => new Date(places.inventory.dataInventario).toISOString().split('T')[0] === dtInventario)

    }    
    if(placesInventoryList.length == 0) {

        return res.status(404).json({message: "Inventário/Local não localizado!"});        

    };

    return res.status(200).send(placesInventoryList);

});

router.get("/:id", async (req, res) => {

    const placesInventory = await PlacesInventory.findById(req.params.id)
                                                .populate("inventory")

    if (!placesInventory) {
        return res.status(404).json({message: "Inventário/Local com Id não encontrado."});        
    };
    return res.status(200).send(placesInventory);

});

router.put("/:id", async(req, res) => {
    
    const placesInventory = await PlacesInventory.findByIdAndUpdate(req.params.id,
        {
            inventory:      req.body.inventory, 
            local:          req.body.local.toUpperCase(),
            situacao:       req.body.situacao.toUpperCase()
        },
        {new: true}
    );

    if (!placesInventory) {        
        return res.status(400).send("O Inventário/Local não pode ser atualizado!");
    }

    return res.send(placesInventory);

});

router.delete("/:id", async (req, res) => {

    //  Verificar se existe Contagem
    const countPlaces = await CountPlaces.find({placesInventory: req.params.id})    
    if (countPlaces.length > 0) return res.status(404).send("Existe Contagem para essa localização!")

    PlacesInventory.findByIdAndDelete(req.params.id)
        .then((placesInventory) => {
            if (placesInventory){
                return res.status(200).json({
                    success: true,
                    message: "Inventário/Local eliminado!"
                });
            } else {
                return res.status(404).json({
                    success: false,
                    message: "Inventário/Local não localizado!"
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