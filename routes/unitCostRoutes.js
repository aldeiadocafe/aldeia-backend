const express = require("express");
const router = express.Router();

const mongoose = require("mongoose")

const UnitCost   = require("../models/UnitCost");
const Company       = require("../models/Company");
const Item          = require("../models/Item");

// Criar
router.post("/", async(req, res) => {

    let unitCost = new UnitCost({
        empresa:            req.body.empresa,
        item:               req.body.item,
        custoUnitario:      req.body.custoUnitario,
        usuarioCriacao:     req.body.usuarioCriacao,
        dataCriacao:        new Date()
    });

    // Verifica duplicidade de Custo Unitário para o mesmo Item/Empresa
    const filter = {};

    if ( req.body.empresa)  filter.empresa    = req.body.empresa
    if ( req.body.item   )  filter.item       = req.body.item

    let unitCostList = await UnitCost.find(filter)
    if(unitCostList.length != 0) return res.status(404).send("Custo Unitário para este Item/Empresa já cadastrado!");

    //  Verificar se existe Empresa
    const empresa = await Company.findById(unitCost.empresa)
    if (!empresa) return res.status(404).send("Empresa não localizada!")

    //  Verificar se existe Item
    const item = await Item.findById(unitCost.item)
    if (!item) return res.status(404).send("Item não localizado!")

    //Iniciar sessao
    const session = await mongoose.startSession()

    //Iniciar Transacao
    session.startTransaction()

    try {

        unitCost = await unitCost.save();
        if(!unitCost) return res.status(400).send("Custo Unitário/Empresa não pode ser criado!");

        res.send(unitCost);

    } catch (error) {

        console.log(error)

        //Abortar
        await session.abortTransaction()

        res.status(400).send("Não foi possível gravar Custo Unitário/Empresa")

    }

});

//Atualizar Custo Unitário do Item
router.post("/atualizarCustoGCOM", async(req, res) => {

    //Iniciar sessao
    const session = await mongoose.startSession()

    //Iniciar Transacao
    session.startTransaction()

    try {

        const unitCost = req.body  // Array

        if (!Array.isArray(unitCost)) {
            return res.status(404).json({ message: 'O corpo da requisição deve ser um array' });
        }

        //  Verificar se existe Empresa
        // 1. Extrair empresas únicas do array para evitar buscas repetidas
        const empresasVerificar = [...new Set(unitCost.map(i => i.empresa))];

        // 2. Verificar no banco de dados se essas empresas existem
        const empresasExistentes = await Company.find({
            _id: { $in: empresasVerificar }
            });

        if (empresasExistentes.length !== empresasVerificar.length) {
            return res.status(404).json({
                message: 'Uma ou mais empresas não são válidas.'
            });
        }

        //  Verificar se existe Items
        // 1. Extrair items únicos do array para evitar buscas repetidas
        const itemsVerificar = [...new Set(unitCost.map(i => i.item))];

        // 2. Verificar no banco de dados se essas empresas existem
        const itemsExistentes = await Item.find({
            _id: { $in: itemsVerificar }
            });

        if (itemsExistentes.length !== itemsVerificar.length) {
            return res.status(404).json({
                message: 'Uma ou mais items não são válidos.'
            });
        }

        const operacoes = unitCost.map(item => {

            return {
                updateOne: {
                    filter: { 
                        empresa:  item.empresa,         //new mongoose.Types.ObjectId(
                        item: item.item
                    }, // Verifica por este campo
                    update: {
                        $set: {
                            custoUnitario:  item.custoUnitario,
                            dataAlteracao:      new Date(),
                            usuarioAlteracao:   item.usuarioAlteracao   
                        }
                    },
                    upsert: true // Não cria um novo documento se não encontrar
                }
            }
        });
        

        // Executa tudo de uma vez
        const resultado = await UnitCost.bulkWrite(operacoes, { session });        

        // Salvar todas as operações
        await session.commitTransaction();

        // Mapeia o array para o formato de consulta do MongoDB
        const filtro = {
            $or: unitCost.map((itemObj) => ({
                empresa: itemObj.empresa,
                item: itemObj.item,
            })),
        };

        const custosEncontrados = await UnitCost.find(filtro)
                                            .populate([
                                                    { path: "empresa" },
                                                    { path: "item" },
                                                    { path: 'usuarioCriacao',   select: 'nome email'},
                                                    { path: 'usuarioAlteracao', select: 'nome email'}
                                                ])
                                            .sort({item: 1,
                                                   empresa: 1});

        return res.status(200).json(custosEncontrados);

/*
        return res.status(200).json({
            success: true,
            message: 'Custo unitário atualizado com sucesso!',
//            modifiedCount: resultado.modifiedCount
        });
*/
    } catch (error) {

        //Abortar
        await session.abortTransaction()

        return res.status(404).json({ 
                success: false,
                message: 'Erro ao Atualizar custo unitário do item',
                error: error.message
            });

    } finally {

        //Finalizar a sessao
        session.endSession()
    }

})


router.get("/:id", async (req, res) => {

    const unitCost = await UnitCost.findById(req.params.id)
                                            .populate([
                                                    { path: "empresa" },
                                                    { path: "item" },
                                                    { path: 'usuarioCriacao',   select: 'nome email'},
                                                    { path: 'usuarioAlteracao', select: 'nome email'}
                                                ])
                                            .sort({item: 1,
                                                   empresa: 1});

    if (!unitCost) {
        return res.status(404).json({message: "Custo Unitário com Id não encontrado."});        
    };
    return res.status(200).send(unitCost);

});

router.get('/', async(req, res) => {
    
    const { empresa, item } = req.query; // Pega os parâmetros da URL
    
    const filter = {};

    if ( empresa )  filter.empresa    = empresa
    if ( item    )  filter.item       = item

    let unitCostList = await UnitCost
                                        .find(filter)
                                        .populate([
                                            { path: "empresa" },
                                            { path: "item" },
                                            { path: 'usuarioCriacao',   select: 'nome email'},
                                            { path: 'usuarioAlteracao', select: 'nome email'}
                                        ])
                                        .sort({item: 1,
                                                empresa: 1});


    if(unitCostList.length == 0) {

        return res.status(404).json({message: "Custo Unitário não localizado!"});        

    };

    return res.status(200).send(unitCostList);

});

router.put("/:id", async(req, res) => {
    
    const unitCost = await UnitCost.findByIdAndUpdate(req.params.id,
        {
            custoUnitario:   req.body.custoUnitario,
            dataAlteracao:      new Date(),
            usuarioAlteracao:   req.body.usuarioAlteracao
        },
        {new: true}
    );

    if (!unitCost) {        
        return res.status(400).send("Custo Unitário não pode ser atualizado!");
    }

    return res.send(unitCost);

});

router.delete("/:id", async (req, res) => {

    UnitCost.findByIdAndDelete(req.params.id)
        .then((unitCost) => {
            if (unitCost){
                return res.status(200).json({
                    success: true,
                    message: "Custo Unitário eliminado!"
                });
            } else {
                return res.status(404).json({
                    success: false,
                    message: "Custo Unitário não localizado!"
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