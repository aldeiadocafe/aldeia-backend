const express = require("express");
const router = express.Router();

const User = require("../models/User");
const Password = require("../models/Password");
const { connectDB } = require("../db/connectDB");

// Criar Reset de Senha
router.post("/", async(req, res) => {

    await connectDB()

    let pw = new Password({
        user: req.body.user,
        dataSolicitacao: Date.now(),
    });

    //Eliminar solicitações anteriores do mesmo usuário
    Password.deleteMany({user: pw.user})
        .then((pw) => {
            if (!pw){
                return res.status(404).json({
                    success: false,
                    message: "Erro ao criar solicitação!"
                });
            }
        }).catch((err) => {
            return res.status(500).json({
                success: false,
                error: err
            });
        });

    pw = await pw.save();

    if(!pw) return res.status(400).send("A solicitação não pode ser criada!");

    res.send(pw);
});

router.get("/:id", async (req, res) => {

    await connectDB()
    
    const pw = await Password.findById(req.params.id)
                             .populate('user');

    if(!pw) {

        return res.status(404).json({message: "Solicitação não encontrada."});        

    };

    if(pw.dataSolicitacao < Date.now() - 3600000) { // Verifica se a solicitação é mais antiga que 1 hora

        return res.status(404).json({message: "Solicitação expirada."});

    }

    if(pw.user.situacao != "ATIVO") { // Verifica se o usuário está ativo

        return res.status(404).json({message: "Usuário inativo."}); 
        
    }

    return res.status(200).send(pw);

});

module.exports = router;