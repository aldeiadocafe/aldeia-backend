const express = require("express");
const router = express.Router();

const mongoose = require("mongoose");

const StockBalance      = require("../models/StockBalance");
const DatesItemBalance  = require("../models/DatesItemBalance")

//Criar registro
router.post("/", async (req, res) => {

    const stockBalance = await StockBalance.findById(req.body.stockBalance);
    if (!stockBalance) return res.status(404).send('Item não localizado!');


    // Verifica se já existe para esse item/data de validade    
    const filter = {}
    filter.stockBalance = req.body.stockBalance

    const dtValidade = new Date(req.body.dataValidade).toISOString().split('T')[0]

    if (dtValidade) filter.dataValidade = dtValidade

    const datesItemList = await DatesItemBalance.find(filter)

    if (datesItemList.length > 0) 
        return res.status(404).json({message: "Item/Data de Validade já cadastrado!"})

    const datesItem = new DatesItemBalance({
            item:           stockBalance.item,
            dataValidade:   dtValidade,
            quantidade:     req.body.quantidade,
    })

    // Iniciar sessão
    const session = await mongoose.startSession();

    // Iniciar transacao
    session.startTransaction();

    try {

        const { quantidade } = req.body

        // Atualizar cada operacao
        await StockBalance.updateOne(
            { _id: stockBalance},
            { $inc: { quantidade: quantidade}},
            { session }    //OBRIGATORIO
        )

        // Criar datesItems
        await datesItem.save();

        // Salva todas as operações se tudo der certo
        await session.commitTransaction();

        res.status(200).send(datesItem);    

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
    
    const { stockBalance, dataValidade } = req.query; // Pega os parâmetros da URL
    
    const filter = {};

    if ( stockBalance ) filter.stockBalance = stockBalance
    if ( dataValidade ) {

        const dtValidade = new Date(dataValidade).toISOString().split('T')[0]
        filter.dataValidade = dtValidade

    }

    const datesItemList = await DatesItemBalance.find(filter)
                                .populate("item")
                                .sort({stockBalance: 1,
                                       dataValidade: 1
                                })

    if (datesItemList.length === 0) {
        return res.status(404).json({message: "Item/Data Validade não encontrado!"})
    }

    return res.status(200).send(datesItemList)
    
})

router.get("/:id", async (req, res) => {
    
    const datesItem = await DatesItemBalance.findById(req.params.id);

    if (!datesItem) {
        return res.status(404).json({message: "Item/Data de Validade com Id não encontrado!"})        
    }

    return res.status(200).send(datesItem);

})

//Alterar Dates
router.put("/:id", async(req, res) => {

    const datesAnt = await DatesItemBalance.findById(req.params.id);
    const idDates  = req.params.id
    const qtdDif = req.body.quantidade - datesAnt.quantidade

    // Iniciar sessão
    const session = await mongoose.startSession();

    // Iniciar transacao
    session.startTransaction();

    try {

        // Atualizar StockBalance
        await StockBalance.updateOne(
            { _id: datesAnt.stockBalance},
            { $inc: { quantidade: qtdDif}},
            { session }    //OBRIGATORIO
        )

        const datesItem = await DatesItemBalance.findByIdAndUpdate(
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

    const datesAnt = await DatesItemBalance.findById(req.params.id);

    // Iniciar sessão
    const session = await mongoose.startSession();

    // Iniciar transacao
    session.startTransaction();

    try {

        // Atualizar cada operacao
        await StockBalance.updateOne(
            { _id: datesAnt.stockBalance},
            { $inc: { quantidade: datesAnt.quantidade * -1}},
            { session }    //OBRIGATORIO
        )

        DatesItemBalance.findByIdAndDelete(req.params.id)
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