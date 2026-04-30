const express = require("express");
const router = express.Router();

const mongoose = require("mongoose")

const Unit = require("../models/Unit");
const Item = require("../models/Item");

const StockBalance = require("../models/StockBalance");
const DatesItemBalance = require("../models/DatesItemBalance")

//Criar Item
router.post("/", async(req, res) => {

    const unit = await Unit.findById(req.body.unit);
    if (!unit) return res.status(404).json({message: "Unidade inválida!"});

    //Verifica se o Item já foi cadastrado
    const { itCodigo, descricao } = req.body; // Pega os parâmetros da URL

    if (itCodigo) {

        const itCodigoVerifica = await Item.find({"itCodigo": itCodigo.toUpperCase().trim()});    
        if(itCodigoVerifica.length != 0) return res.status(404).send("Código do Item já cadastrado!");

    }

    if (descricao) {

        const descricaoVerifica = await Item.find({"descricao": descricao.toUpperCase().trim()});    
        if(descricaoVerifica.length != 0) return res.status(404).send("Descrição do Item já cadastrado!");

    }


    let item = new Item({
        itCodigo:           req.body.itCodigo.toUpperCase().trim(),
        descricao:          req.body.descricao.toUpperCase().trim(),
        situacao:           req.body.situacao.toUpperCase(),
        unit,
        dataCriacao:        new Date(),
        usuarioCriacao:     req.body.usuarioCriacao,
        quantidadeMinima:   req.body.quantidadeMinima
    });

    item = await item.save();

    if(!item) return res.status(400).send("o item não pode ser criado!");

    res.send(item);

});

//Criar Item GCOM
router.post("/gcom", async(req, res) => {

    //Iniciar sessao
    const session = await mongoose.startSession()

    //Iniciar Transacao
    session.startTransaction()

    try {

        const items = req.body  // Array

        if (!Array.isArray(items)) {
            return res.status(404).json({ message: 'O corpo da requisição deve ser um array' });
        }

        // 1. Extrair unidades únicas do array para evitar buscas repetidas
        const unidadesParaVerificar = [...new Set(items.map(i => i.unit._id))];

        // 2. Verificar no banco de dados se essas unidades existem
        const unidadesExistentes = await Unit.find({
            _id: { $in: unidadesParaVerificar }
            });

        if (unidadesExistentes.length !== unidadesParaVerificar.length) {
            return res.status(404).json({
                message: 'Uma ou mais unidades de medida não são válidas.'
            });
        }


/*        
        // 3. Se tudo estiver correto, criar itens
        const novosItens = await Item.insertMany(items);
        res.status(201).json(novosItens);
*/

        // Prepara as operações para o bulkWrite
        const operations = items.map(item => ({
            updateOne: {
                filter: { itCodigo: item.itCodigo }, // Verifica por este campo
                update: { $setOnInsert: {
                    itCodigo:           item.itCodigo.toUpperCase(),
                    descricao:          item.descricao.toUpperCase(),
                    situacao:           item.situacao.toUpperCase(),
                    unit:               item.unit,
                    dataCriacao:        new Date(),
                    usuarioCriacao:     item.usuarioCriacao,
                } }, // Cria apenas se não existir
                upsert: true // Ativa a criação se não encontrar
            }
        }));

        // Executa tudo de uma vez
        const itemsCreate = await Item.bulkWrite(operations, {session});

        // Salvar todas as operações
        await session.commitTransaction();

        // Carregar Itens criados usando os IDs retornados pelo bulkWrite
        const upsertedIds = Object.values(itemsCreate.upsertedIds);
        const itemsCriados = await Item.find({ _id: { $in: upsertedIds } });
        return res.status(200).send(itemsCriados)
/*        
        await session.abortTransaction()
        return res.status(200).send(itemsCriados)
*/

    } catch (error) {

        //Abortar
        await session.abortTransaction()

        return res.status(404).json({ 
                success: false,
                message: 'Erro ao criar itens GCom'
            });

    } finally {

        //Finalizar a sessao
        session.endSession()
    }

});

//Listar Itens
router.get('/', async(req, res) => {
    //res.status(200).send("chegou em itens");

    const itemList = await Item.find()
                               .sort({descricao: 1})
//                               .populate("unit")
                               .populate([
                                   { path: 'usuarioCriacao',   select: 'nome email'},
                                   { path: 'usuarioAlteracao', select: 'nome email'},
                                   { path: 'unit' }
                               ])


    if(!itemList) {
        res.status(500).json({success: false});
    };

    res.status(200).send(itemList);

});

//Listar Item especifico
router.get("/:id", async (req, res) => {
    const item = await Item.findById(req.params.id)
                            .populate([
                                { path: 'usuarioCriacao',   select: 'nome email'},
                                { path: 'usuarioAlteracao', select: 'nome email'},
                                { path: 'unit' }
                            ])


    if (!item) {
        res.status(404).json({message: "Item com Id não encontrado."});        
    };
    res.status(200).send(item);
});

//Search itCodigo
router.get("/searchItCodigo", async (req, res) => {

//    const searchItCodigo = req.query.itCodigo;
console.log(req.query)
/*
    try {
        // 'i' option makes it case-insensitive
        const results = await Item.find({
            itCodigo: new RegExp(searchItCodigo, 'i')
        })
        res.status(200).send(results);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error')
    }
*/        
res.status(500).send('Achou erro')
})

//Alterar Item
router.put("/:id", async(req, res) => {

    const item = await Item.findByIdAndUpdate(req.params.id,
        {
            itCodigo:           req.body.itCodigo.toUpperCase(),
            descricao:          req.body.descricao.toUpperCase(),
            situacao:           req.body.situacao.toUpperCase(),
            unit:               req.body.unit,
            dataAlteracao:      new Date(),
            usuarioAlteracao:   req.body.usuarioAlteracao,
            quantidadeMinima:   req.body.quantidadeMinima

        },
        {new: true}
    );

    if (!item) {
        return res.status(400).send("O item não pode ser atualizado!");
    }

    res.send(item);

});

//Eliminar Item
router.delete("/:id", async (req, res) => {

    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({message: "Item não encontrado!"});  

    //Verifica se o Item está sendo utilizado
    const stock = await StockBalance.find({item: item._id});
    if (stock && stock.length > 0) return res.status(404).json({message: "Item utilizado no estoque!"});

    const dates = await DatesItemBalance.find({item: item._id});
    if (dates && dates.length > 0) return res.status(404).json({message: "Item com Data Validade utilizado!"});

    Item.findByIdAndDelete(req.params.id)
        .then((item) => {
            if (item){
                return res.status(200).json({
                    success: true,
                    message: "Item eliminado!"
                });
            } else {
                return res.status(404).json({
                    success: false,
                    message: "Item não localizado!"
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