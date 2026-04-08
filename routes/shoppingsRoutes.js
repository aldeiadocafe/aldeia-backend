const express = require("express");
const router = express.Router();

const mongoose = require("mongoose");

const User = require("../models/User")
const Shopping = require("../models/Shopping");
const { connectDB } = require("../db/connectDB");

//Criar registro
router.post("/", async (req, res) => {

    await connectDB()

    const user = await User.findById(req.body.usuarioSolicitacao);
    if (!user) return res.status(404).send('Usuário de Solicitação Inválido!');

    let shoppings = new Shopping({
        empresas:           req.body.empresas,
        itCodigo:           req.body.itCodigo.toUpperCase(),
        quantidade:         req.body.quantidade,
        comprado:           req.body.comprado ? req.body.comprado : false,
        eliminado:          req.body.eliminado ? req.body.eliminado : false,
        usuarioSolicitacao: req.body.usuarioSolicitacao,
        dataSolicitacao:    req.body.dataSolicitacao,
        usuarioCompra:      req.body.usuarioCompra,
        dataCompra:         req.body.dataCompra,
    })

    shoppings = await shoppings.save();

    if (!shoppings) return res.status(400).send("Não foi possível criar Item de Compra!");

    res.send(shoppings);    

})

router.get('/', async(req, res) => {
    
    await connectDB()

    const { dataSolicitacao, usuarioSolicitacao, dataCompra, itCodigo} = req.query; // Pega os parâmetros da URL
    
    const filter = {};

    if (usuarioSolicitacao) filter.usuarioSolicitacao = usuarioSolicitacao
    if (itCodigo)           filter.itCodigo = itCodigo

    if ( dataSolicitacao ) {

        const data = new Date(dataSolicitacao).toISOString().split('T')[0]
        filter.dataSolicitacao = {$gte: data + "T00:00:00.000+00:00", 
                                  $lte: data + "T23:59:59.000+00:00"}

    }

    if ( dataCompra ) {

        const data = new Date(dataCompra).toISOString().split('T')[0]
        filter.dataCompra = {$gte: data + "T00:00:00.000+00:00", 
                             $lte: data + "T23:59:59.000+00:00"}

    }

    const shoppingList = await Shopping.find(filter)                            
                            .populate([
                                { path: "empresas" },
                                { path: 'usuarioSolicitacao', select: 'nome email'},
                                { path: 'usuarioCompra'     , select: 'nome email'}
                            ])

    if (shoppingList.length === 0) {
        return res.status(404).json({message: "Lista de Compra não encontrada!"})
    }

    return res.status(200).send(shoppingList)
    
})

router.get("/:id", async (req, res) => {
    
    await connectDB()

    const shopping = await Shopping.findById(req.params.id)
                            .populate([
                                { path: "empresas"},
                                { path: 'usuarioSolicitacao', select: 'nome email'},
                                { path: 'usuarioCompra'     , select: 'nome email'}
                            ])


    if (!shopping) {
        return res.status(404).json({message: "Item de Compra com Id não encontrado!"})        
    }

    return res.status(200).send(shopping);

})

//Alterar
router.put("/:id", async(req, res) => {

    await connectDB()

    if (req.body.usuarioCompra) {

        const user = await User.findById(req.body.usuarioCompra._id);
        if (!user) return res.status(404).send('Usuário de Compra Inválido!');

    }

    if (req.body.usuarioEliminacao) {

        const user = await User.findById(req.body.usuarioEliminacao._id);
        if (!user) return res.status(404).send('Usuário de Eliminação Inválido!');

    }

    try {
        const shopping = await Shopping.findByIdAndUpdate(
            req.params.id,
            {   $set: { 
                comprado:           req.body.comprado,
                usuarioCompra:      req.body.usuarioCompra,
                dataCompra:         req.body.dataCompra,
                eliminado:          req.body.eliminado,
                usuarioEliminacao:  req.body.usuarioEliminacao,
                dataEliminacao:     req.body.dataEliminacao
                }
            },
            {new: true, runValidators: true }    // RunValidators garante validação do schema
        );

        if (!shopping) {
            return res.status(400).send("Lista de Compra não pode ser atualizada!");
        }

        res.send(shopping);

    } catch (error) {

        res.status(400).json({ error: error.message})
    }

//res.status(400).send("teste")

});

router.delete("/:id", async (req, res) => {

    Shopping.findByIdAndDelete(req.params.id)
        .then((shopping) => {
            if (shopping){
                return res.status(200).json({
                    success: true,
                    message: "Item de Compra eliminada!"
                });
            } else {
                return res.status(404).json({
                    success: false,
                    message: "Item de Compra não localizada!"
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