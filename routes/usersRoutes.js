const express = require("express");
const bcrypt = require('bcryptjs');
const router = express.Router();

const User = require("../models/User");
const { connectDB } = require("../db/connectDB");

// Criar
router.post("/", async(req, res) => {

    await connectDB()

    // 1. Gerar salt e hash (10 é o custo padrão/recomendado)
    const hashedPassword = await bcrypt.hash(req.body.senha, 10);

    let user = new User({
        email:      req.body.email.toUpperCase(),
        nome:       req.body.nome.toUpperCase(),
        senha:      hashedPassword,
        telefone:   req.body.telefone,
        situacao:   req.body.situacao ? req.body.situacao.toUpperCase() : 'ATIVO',
        empresas:   req.body.empresas,
        usuarioCriacao: req.body.usuarioCriacao,
        dataCriacao:    new Date()

    });

    //Verificar se já existe
    const userVerifica = await User.find({nome: req.body.nome});
    if(userVerifica.length != 0) return res.status(404).send("Nome já cadastrado!");

    user = await user.save();

    if(!user) return res.status(400).send("Usuário não pode ser criado!");

    res.send(user);

//    res.send("teste")
});

router.get('/', async(req, res) => {

    await connectDB()

    const { email, nome } = req.query; // Pega os parâmetros da URL
    const filter = {};

    if (email)  filter.email    = email.toUpperCase();
    if (nome)   filter.nome     = nome.toUpperCase();

    const userList = await User.find(filter)
                               .populate([
                                   { path: "empresas" },
                                   { path: 'usuarioCriacao',   select: 'nome email'},
                                   { path: 'usuarioAlteracao', select: 'nome email'},
                               ])
                                .sort({nome: 1})
    if(userList.length === 0) {

        return res.status(404).json({message: "Usuario não encontrado."});        

    };

    return res.status(200).send(userList);

});

router.get("/:id", async (req, res) => {

    await connectDB()
    const user = await User.findById(req.params.id)
                            .populate([
                                { path: "empresas" },
                                { path: 'usuarioCriacao',   select: 'nome email'},
                                { path: 'usuarioAlteracao', select: 'nome email'}
                            ])


    if (!user) {
        return res.status(404).json({message: "Usuário com Id não encontrado."});        
    };
    return res.status(200).send(user);

});

router.put("/:id", async(req, res) => {

    await connectDB()

    const updateData = req.body;

    updateData.dataAlteracao    = new Date()
    updateData.usuarioAlteracao = req.body.usuarioAlteracao

    if (req.body.email)             updateData.email = req.body.email.toUpperCase();
    if (req.body.nome)              updateData.nome = req.body.nome.toUpperCase();
    if (req.body.telefone)          updateData.telefone = req.body.telefone;
    if (req.body.situacao)          updateData.situacao = req.body.situacao.toUpperCase();
    if (req.body.empresas)          updateData.empresas = req.body.empresas;   

    if (req.body.senha) {
        // 1. Gerar salt e hash (10 é o custo padrão/recomendado)
        const hashedPassword = await bcrypt.hash(req.body.senha, 10);
        updateData.senha = hashedPassword;
    }
        
    const user = await User.findByIdAndUpdate(
        req.params.id,
        { $set: updateData },
        { new: true, runValidators: true }
    );

    if (!user) {
        return res.status(400).send("Usuário não pode ser atualizado!");
    }

    return res.send(user);

});

router.delete("/:id", (req, res) => {

    User.findByIdAndDelete(req.params.id)
        .then((user) => {
            if (user){
                return res.status(200).json({
                    success: true,
                    message: "Usuário eliminado!"
                });
            } else {
                return res.status(404).json({
                    success: false,
                    message: "Usuário não localizado!"
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