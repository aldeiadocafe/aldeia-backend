const express = require("express");
const router = express.Router();

const { connectDB } = require("../db/connectDB");
const DraftSchedule = require("../models/DraftSchedule");
const Company = require("../models/Company");
const User = require("../models/User");
const TypeEvent = require("../models/TypeEvent");
const { default: mongoose } = require("mongoose");

// Criar Um Evento
router.post("/", async(req, res) => {

    await connectDB()

    let draft = new DraftSchedule({
        empresa:    req.body.empresa,
        usuario:    req.body.usuario,      
        tipoEvento: req.body.tipoEvento,             
        dia:        req.body.dia,
    });

    //Verificar se já existe a unidade
    const draftVerifica = await DraftSchedule.find(
        {empresa: req.body.empresa, usuario: req.body.usuario, dia:     req.body.dia}
    );
    if(draftVerifica.length != 0) return res.status(404).send("Rascunho já cadastrada");

    draft = await draft.save();

    if(!draft) return res.status(400).send("Rascunho não pode ser criada!");

    res.send(draft);

});

// Gravar todos os Eventos
router.post("/saveDraft", async(req, res) => {

    //Iniciar session
    const session = await mongoose.startSession()

    //Iniciar Transacao
    session.startTransaction()

    try {

        const eventos = req.body

        if (!Array.isArray(eventos)) {
            return res.status(404).json({ message: 'O corpo da requisição deve ser um array' });
        }

        // 1. Extrair empresas únicas do array para evitar buscas repetidas
        const empresasParaVerificar = [...new Set(eventos.map(i => i.empresa))];

        // 2. Verificar no banco de dados se essas empresas existem
        const empresasExistentes = await Company.find({
            _id: { $in: empresasParaVerificar }
            });

        if (empresasExistentes.length !== empresasParaVerificar.length) {
            return res.status(404).json({
                message: 'Uma ou mais empresas não são válidas.'
            });
        }

        const usersParaVerificar = [...new Set(eventos.map(i => i.usuario))];        
        const usersExistentes = await User.find({
            _id: { $in: usersParaVerificar }
            });
        if (usersExistentes.length !== usersParaVerificar.length) {
            return res.status(404).json({
                message: 'Uma ou mais usuários não são válidas.'
            });
        }

        const tiposParaVerificar = [...new Set(eventos.map(i => i.tipoEvento))];
        const tiposExistentes = await TypeEvent.find({
            _id: { $in: tiposParaVerificar }
            });
        if (tiposExistentes.length !== tiposParaVerificar.length) {            
            return res.status(404).json({
                message: 'Uma ou mais tipos de evento não são válidas.'
            });
        }

        await DraftSchedule.deleteMany({})

        // Preparar as operações
        const operations = eventos.map(evento => ({
            updateOne: {
                filter: { 
                    empresa:    evento.empresa,
                    usuario:    evento.usuario,
                    dia:        evento.dia                    
                },
                update: { $setOnInsert: {
                    empresa:    evento.empresa,
                    usuario:    evento.usuario,
                    tipoEvento: evento.tipoEvento,
                    dia:        evento.dia                    
                }},
                upsert: true
            }
        }))

        // Executa tudop de uma vez
        const eventosCreate = await DraftSchedule.bulkWrite(operations, {session})

        // Salvar todas as operações
        await session.commitTransaction()

        // Carregar Itens criados usando os IDs retornados pelo bulkWrite
        const upsertedIds = Object.values(eventosCreate.upsertedIds);
        const eventosCriados = await DraftSchedule.find({ _id: { $in: upsertedIds } });

        return res.status(200).send(eventosCriados)
/*
          await session.abortTransaction()
        return res.status(200).send("teste")
*/        
    } catch (error) {

        //Abortar
        await session.abortTransaction()

        return res.status(404).json({ 
                success: false,
                message: 'Erro ao criar Draft de Escala'
            });

    } finally {

        //Finalizar a sessao
        session.endSession()
    }

})

router.get('/', async(req, res) => {

    await connectDB()

    const { empresa, usuario, tipoEvento } = req.query; // Pega os parâmetros da URL
    const filter = {};

    if (empresa)    filter.empresa      = empresa;
    if (usuario)    filter.usuario      = usuario;
    if (tipoEvento) filter.tipoEvento   = tipoEvento;

    
    const draftList = await DraftSchedule.find(filter)
                                    .populate([
                                        { path: 'empresa'},
                                        { path: 'usuario'},
                                        { path: 'tipoEvento'}
                                    ])
                                    .sort({empresa: 1, usuario: 1, dia: 1});

    if(draftList.length === 0) {

        return res.status(404).json({message: "Rascunho não encontrada."});

    };

    return res.status(200).send(draftList);

});

router.get("/:id", async (req, res) => {

    await connectDB()
    const draft = await DraftSchedule.findById(req.params.id)
                                    .populate([
                                        { path: 'empresa'},
                                        { path: 'usuario'},
                                        { path: 'tipoEvento'}
                                    ])


    if (!draft) {
        return res.status(404).json({message: "Rascunho com Id não encontrado."});        
    };
    return res.status(200).send(draft);

});

router.put("/:id", async(req, res) => {

    await connectDB()

    try {
        const draft = await DraftSchedule.findByIdAndUpdate(
            req.params.id,
            {
                $set: {
                    empresa:    req.body.empresa,
                    usuario:    req.body.usuario,      
                    tipoEvento: req.body.tipoEvento,             
                    dia:        req.body.dia,
                }
            },
            {new: true, runValidators: true }    // RunValidators garante validação do schema
        );

        if (!draft) {
            return res.status(400).send("Rascunho não pode ser atualizada!");
        }

        return res.send(draft);

    } catch (error) {

        // ESSENCIAL: Logar o erro no terminal do servidor
        console.error("Erro no Mongoose:", error);

        // Retornar o erro para o React
        res.status(500).json({ 
            message: 'Erro ao atualizar no banco de dados', 
            error: error.message 
        });
        }

});

router.delete("/:id", (req, res) => {

    DraftSchedule.findByIdAndDelete(req.params.id)
        .then((draft) => {
            if (draft){
                return res.status(200).json({
                    success: true,
                    message: "Rascunho eliminada!"
                });
            } else {
                return res.status(404).json({
                    success: false,
                    message: "Rascunho não localizada!"
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