const express = require("express");
const router = express.Router();

const mongoose = require("mongoose")

const Inventory             = require("../models/Inventory")
const ItemsInventory        = require("../models/ItemsInventory")
const DatesItemsInventory   = require("../models/DatesItemInventory")
const PlacesInventory       = require("../models/PlacesInventory")
const CountPlaces           = require("../models/CountPlaces")
const Item                  = require("../models/Item")


//Atualizar tabelas Inventário
const atualizarTabelasInventario = async (session, countPlaces) => {
/*
    let countPlaces = new CountPlaces({
        placesInventory:    req.body.placesInventory,
        item:               req.body.item,
        dataValidade:       dtValidade,
        quantidade:         req.body.quantidade
    });
*/
    let idItemsIvent

    const placesInv = await PlacesInventory.findById(countPlaces.placesInventory)

    const filter = {};
    filter.inventory = placesInv.inventory
    filter.item      = countPlaces.item
  
    let itemsInventory = await ItemsInventory.findOne(filter)
    if (!itemsInventory) {

        //Criar Item de Inventario
        let itemsInvent = new ItemsInventory({
            inventory:  placesInv.inventory,
            item:       countPlaces.item,
            quantidade: countPlaces.quantidade
        });

        itemsInventory = await itemsInvent.save({session});
        idItemsIvent = itemsInvent._id

    } else {

        idItemsIvent = itemsInventory._id

        // $inc somar o valor atual (pode ser negativo para subtrair)
        await ItemsInventory.findByIdAndUpdate(
                                idItemsIvent,
                                { $inc: { quantidade: countPlaces.quantidade } },
                                { new: true, runValidators: true } // Retorna o documento modificado
                            )

    }

    const filterDates = {}
    filterDates.itemsInventory = idItemsIvent
    filterDates.dataValidade= countPlaces.dataValidade

    const datesInventory = await DatesItemsInventory.findOne(filterDates)
    if (!datesInventory) {

        //Criar Data de Validade do Item de Inventario
        const datesInvent = new DatesItemsInventory({
            itemsInventory: idItemsIvent,
            dataValidade:   countPlaces.dataValidade,
            quantidade:     countPlaces.quantidade
        });

        await datesInvent.save({session})

    } else {

        // $inc somar o valor atual (pode ser negativo para subtrair)
        await DatesItemsInventory.findByIdAndUpdate(
            datesInventory._id,
            { $inc: { quantidade: countPlaces.quantidade } },
            { new: true, runValidators: true, session: session } // Retorna o documento modificado
        )

    }

}

// Criar
router.post("/", async(req, res) => {
   
    const dtValidade = new Date(req.body.dataValidade).toISOString().split('T')[0]

    let countPlaces = new CountPlaces({
        placesInventory:    req.body.placesInventory,
        item:               req.body.item,
        dataValidade:       dtValidade,
        quantidade:         req.body.quantidade
    });
    
    //  Verificar se existe Inventory
    const placesInventory = await PlacesInventory.findById(countPlaces.placesInventory)
    if (!placesInventory) return res.status(404).send("Local de Inventário não localizado!")

    //  Verificar se existe Item
    const item = await Item.findById(req.body.item)
    if (!item) return res.status(404).send("Item não localizado!")

    //Iniciar sessao
    const session = await mongoose.startSession()
    
    //Iniciar Transacao
    session.startTransaction()

    try {

        countPlaces = await countPlaces.save({session});
        if(!countPlaces) return res.status(400).send("Contagem do Item/Local não pode ser criado!");

        await Inventory.findByIdAndUpdate(
            placesInventory.inventory,
            {   $set: {                             // Atualiza apenas um campo
                    situacao: 'EM PROCESSO'
                }
            },
            {session, new: true, runValidators: true }    // RunValidators garante validação do schema
        );

        await PlacesInventory.findByIdAndUpdate(
            placesInventory._id,
            {   $set: {                             // Atualiza apenas um campo
                    situacao: 'EM PROCESSO'
                }
            },
            {session, new: true, runValidators: true }    // RunValidators garante validação do schema
        );

        //Atualizar tabelas de inventário
        await atualizarTabelasInventario(session, countPlaces)
        
        //Gravar todas operacoes
        await session.commitTransaction()

        res.send(countPlaces);
        
    } catch (error) {

        console.log(error)

        //Abortar
        await session.abortTransaction()

        res.status(400).send("Não foi possível gravar a Contagem do Item/Local")

    } finally {

        //Finalizar a sessao
        session.endSession()
    }

});

router.get('/', async(req, res) => {
    
    const { placesInventory, item, dataValidade } = req.query; // Pega os parâmetros da URL
    
    const filter = {};

    if ( placesInventory )  filter.placesInventory  = placesInventory
    if ( item )             filter.item             = item
    if ( dataValidade ) {

        const dtValidade = new Date(dataValidade).toISOString().split('T')[0]
        filter.dataValidade     = dtValidade

    }
    
    const countPlacesList = await CountPlaces
                                        .find(filter)
                                        .populate("placesInventory")
                                        .populate("item")
                                        .sort({placesInventory: 1,
                                                item: 1,
                                                dataValidade: 1});


    if(countPlacesList.length === 0) {

        return res.status(404).json({message: "Contagem de Local/Item não localizado!"});        

    };

    return res.status(200).send(countPlacesList);

});

router.get("/:id", async (req, res) => {
    
    const countPlaces = await CountPlaces.findById(req.params.id);

    if (!countPlaces) {
        return res.status(404).json({message: "Contagem Local/Item com Id não encontrado."});        
    };
    return res.status(200).send(countPlaces);

});

//Atualizar
router.put("/:id", async(req, res) => {

    let countPlaces = await CountPlaces.findById(req.params.id, 'quantidade')
    countPlaces.quantidade =  countPlaces.quantidade - req.body.quantidade

    //Iniciar sessao
    const session = await mongoose.startSession()
    
    //Iniciar Transacao
    session.startTransaction()

    try {
        
        const countPlaces = await CountPlaces.findByIdAndUpdate(
            req.params.id,
            {   $set: {                             // Atualiza apenas um campo
                    quantidade: req.body.quantidade
                }
            },
            { session, new: true, runValidators: true }    // RunValidators garante validação do schema
        );

        if (!countPlaces) {        
            return res.status(400).send("Contagem Local/Item não pode ser atualizado!");
        } else {

            //Atualizar tabelas de inventário
            await atualizarTabelasInventario(session, countPlaces)

        }

        //Gravar dados
        await session.commitTransaction()

        return res.send(countPlaces);

    } catch (error) {

        console.log(error)

        // Abortar
        await session.abortTransaction();

        return res.status(400).send("Contagem Local/Item não pode ser atualizado!");

    } finally {

        //Finalizar a sessao
        session.endSession()
    }
    

});

router.delete("/:id", async (req, res) => {

    let countPlaces = await CountPlaces.findById(req.params.id)
    countPlaces.quantidade = countPlaces.quantidade * -1

    //Iniciar sessao
    const session = await mongoose.startSession()
    
    //Iniciar Transacao
    session.startTransaction()

    try {

        const deleteCount = await CountPlaces.findByIdAndDelete(req.params.id).session(session)
        if (!deleteCount) {

            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({
                success: false,
                message: "Contagem Local/Item não localizado!"
            });

        }

        //Atualizar tabelas de inventário
        await atualizarTabelasInventario(session, countPlaces)

        //Gravar dados
        await session.commitTransaction()

        return res.status(200).json({
            success: true,
            message: "Contagem Local/Item eliminado!"
        })

    } catch (error) {

        console.log(error)

        // Abortar
        await session.abortTransaction();

        return res.status(400).send("Contagem Local/Item não pode ser eliminada!");

    } finally {

        //Finalizar a sessao
        session.endSession()
    }

        
});

module.exports = router;