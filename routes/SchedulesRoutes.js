const express = require("express");
const router = express.Router();

const { connectDB } = require("../db/connectDB");
const Schedule = require("../models/Schedule");

// Criar Unidade
router.post("/", async(req, res) => {

    await connectDB()

    let schedule = new Schedule({
        empresa:    req.body.empresa,
        usuario:    req.body.usuario,      
        tipoEvento: req.body.tipoEvento,             
        dia:        req.body.dia,
    });

    //Verificar se já existe a unidade
    const scheduleVerifica = await Schedule.find(
        {empresa: req.body.empresa, usuario: req.body.usuario, dia:     req.body.dia}
    );
    if(scheduleVerifica.length != 0) return res.status(404).send("Escala já cadastrada!");

    schedule = await schedule.save();

    if(!schedule) return res.status(400).send("Escala não pode ser criada!");

    res.send(schedule);
});

router.get('/', async(req, res) => {

    await connectDB()

    const { empresa, usuario, tipoEvento } = req.query; // Pega os parâmetros da URL
    const filter = {};

    if (empresa)    filter.empresa      = empresa;
    if (usuario)    filter.usuario      = usuario;
    if (tipoEvento) filter.tipoEvento   = tipoEvento;

    
    const scheduleList = await Schedule.find(filter)
                                    .populate([
                                        { path: 'empresa'},
                                        { path: 'usuario'}
                                    ])
                                    .sort({empresa: 1, usuario: 1, dia: 1});

    if(scheduleList.length === 0) {

        return res.status(404).json({message: "Escala não encontrada."});

    };

    return res.status(200).send(scheduleList);

});

router.get("/:id", async (req, res) => {

    await connectDB()
    const schedule = await Schedule.findById(req.params.id)
                                    .populate([
                                        { path: 'empresa'},
                                        { path: 'usuario'}
                                    ])


    if (!schedule) {
        return res.status(404).json({message: "Escala com Id não encontrado."});        
    };
    return res.status(200).send(schedule);

});

router.put("/:id", async(req, res) => {

    await connectDB()

    try {
        const schedule = await Schedule.findByIdAndUpdate(
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

        if (!schedule) {
            return res.status(400).send("Escala não pode ser atualizada!");
        }

        return res.send(schedule);

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

    Schedule.findByIdAndDelete(req.params.id)
        .then((schedule) => {
            if (schedule){
                return res.status(200).json({
                    success: true,
                    message: "Escala eliminada!"
                });
            } else {
                return res.status(404).json({
                    success: false,
                    message: "Escala não localizada!"
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