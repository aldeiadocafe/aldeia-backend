const express = require("express");
const router = express.Router();

const mongoose = require("mongoose");

const ItemsInventory = require("../models/ItemsInventory")
const DatesItemInventory = require("../models/DatesItemInventory")

//Criar registro
router.post("/", async (req, res) => {

    const itemsInventory = await ItemsInventory.findById(req.body.itemsInventory);
    if (!itemsInventory) return res.status(404).send('Item de Inventário Inválido!');

    // Verifica se já existe para esse item/data de validade    
    const filter = {}
    filter.inventory = req.body.inventory

    const dtValidade = new Date(req.body.dataValidade).toISOString().split('T')[0]

    if (dtValidade) filter.dataValidade = dtValidade

    const datesItemList = await DatesItemInventory.find(filter)

    if (datesItemList.length > 0) 
        return res.status(404).json({message: "Item/Data de Validade já cadastrado!"})

    let datesItem = new DatesItemInventory({
        itemsInventory: req.body.itemsInventory,
        dataValidade:   dtValidade,
        quantidade:     req.body.quantidade,
        usuarioCriacao: req.body.usuarioCriacao,
        dataCriacao:    new Date()

    })

    // Iniciar sessão
    const session = await mongoose.startSession();

    // Iniciar transacao
    session.startTransaction();

    try {

        const { itemsInventory, quantidade } = req.body

        // Atualizar cada operacao
        await ItemsInventory.updateOne(
            { _id: itemsInventory},
            { $inc: { quantidade: quantidade}},
            { $set: {
                dataAlteracao:    new Date(),
                usuarioAlteracao: req.body.usuarioCriacao
            }},
            { session }    //OBRIGATORIO
        )

        // Criar datesItems
        await datesItem.save();

        // Salva todas as operações se tudo der certo
        await session.commitTransaction();

        res.send(datesItem);    

    } catch (error) {

        console.log(error)

        // Abortar
        await session.abortTransaction();

        res.status(400).send("Item/Data de Validade não pode ser criado!");

    } finally {

        //Finalizar a sessao
        session.endSession()
    }

})

router.get('/', async(req, res) => {
    
    const { item, dataValidade } = req.query; // Pega os parâmetros da URL

    const filter = {};
    if(dataValidade) {
        filter.dataValidade = new Date(dataValidade).toISOString().split('T')[0]
    }  

    let matchCondition = {}
    if (item) matchCondition = { item: item }
    const datesItemList = await DatesItemInventory.find(filter)
                                .populate([
                                    { path: "itemsInventory", match: matchCondition },
                                    { path: 'usuarioCriacao',   select: 'nome email'},
                                    { path: 'usuarioAlteracao', select: 'nome email'}
                                ])
                                .sort({itemsInventory: 1,
                                       dataValidade: 1
                                })

    if (datesItemList.length === 0) {
        return res.status(404).json({message: "Item/Data Validade não encontrado!"})
    }

    //Remover item nulo
    const resultado = datesItemList.filter(datesItem => datesItem.itemsInventory !== null)
    return res.status(200).send(resultado)
    
})

router.get("/:id", async (req, res) => {
    
    const datesItem = await DatesItemInventory.findById(req.params.id)
                                            .populate(
                                                { path: "itemsInventory", match: matchCondition },
                                                { path: 'usuarioCriacao',   select: 'nome email'},
                                                { path: 'usuarioAlteracao', select: 'nome email'}
                                            )

    if (!datesItem) {
        return res.status(404).json({message: "Item/Data de Validade com Id não encontrado!"})        
    }

    return res.status(200).send(datesItem);

})

//Alterar Dates
router.put("/:id", async(req, res) => {

    const datesAnt = await DatesItemInventory.findById(req.params.id);
    const idDates  = req.params.id
    const qtdDif = req.body.quantidade - datesAnt.quantidade

    // Iniciar sessão
    const session = await mongoose.startSession();

    // Iniciar transacao
    session.startTransaction();

    try {

        // Atualizar ItemsInvent
        await ItemsInventory.updateOne(
            { _id: datesAnt.itemsInventory},
            { $inc: { quantidade: qtdDif}},
            { $set: {
                dataAlteracao:    new Date(),
                usuarioAlteracao: req.body.usuarioAlteracao
            }},
            { session }    //OBRIGATORIO
        )

        const datesItem = await DatesItemInventory.findByIdAndUpdate(
            req.params.id,
            {   $set: {                             // Atualiza apenas um campo
                    quantidade: req.body.quantidade
                }
            },
            {new: true, runValidators: true }    // RunValidators garante validação do schema
        );

        //Salva todas as operacoes
        await session.commitTransaction();

        res.send(datesItem);

    } catch (error) {

        //Abortar
        await session.abortTransaction();

        res.status(400).send("Item/Data de Validade não pode ser atualizado!");

    } finally {

        //Finalizar a sessao
        session.endSession()

    }

});


router.delete("/:id", async (req, res) => {

    const datesAnt = await DatesItemInventory.findById(req.params.id);

    // Iniciar sessão
    const session = await mongoose.startSession();

    // Iniciar transacao
    session.startTransaction();

    try {

        // Atualizar cada operacao
        await ItemsInventory.updateOne(
            { _id: datesAnt.itemsInventory},
            { $inc: { quantidade: datesAnt.quantidade * -1}},
            { $set: {
                dataAlteracao:    new Date(),
                usuarioAlteracao: req.body.usuarioAlteracao
            }},
            { session }    //OBRIGATORIO
        )

        DatesItemInventory.findByIdAndDelete(req.params.id)
            .then((datesItem) => {
                if (datesItem){
                    res.status(200).json({
                        success: true,
                        message: "Item/Data de Validade eliminado!"
                    });
                } else {
                    res.status(404).json({
                        success: false,
                        message: "Item/Data de Validade não localizado!"
                    });
                }
            }).catch((err) => {
                res.status(500).json({
                    success: false,
                    error: err
                });
            });

        // Salva todas as operações se tudo der certo
        await session.commitTransaction();

    } catch (error) {

        // Abortar
        await session.abortTransaction();

        res.status(400).send("Item/Data de Validade não pode ser eliminado!");

    } finally {

        //Finalizar a sessao
        session.endSession()
            
    }


})

module.exports = router;