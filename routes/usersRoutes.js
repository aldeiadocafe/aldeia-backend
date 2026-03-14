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
        companys:   req.body.companys
    });

    //Verificar se já existe
    const userVerifica = await User.find({email: req.body.email});
    if(userVerifica.length != 0) return res.status(404).send("Usuário já cadastrado!");

    user = await user.save();

    if(!user) return res.status(400).send("Usuário não pode ser criado!");

    res.send(user);

//    res.send("teste")
});

router.get('/', async(req, res) => {

    await connectDB()

    const { email, nome } = req.query; // Pega os parâmetros da URL
    const filter = {};

    if (email)  filter.email    = email;
    if (nome)   filter.nome     = nome;

    const userList = await User.find(filter)
                                .sort({nome: 1})
                                .populate("companys")

    if(userList.length === 0) {

        return res.status(404).json({message: "Usuario não encontrado."});        

    };

    return res.status(200).send(userList);

});

router.get("/:id", async (req, res) => {

    await connectDB()
    const user = await User.findById(req.params.id);

    if (!user) {
        return res.status(404).json({message: "Usuário com Id não encontrado."});        
    };
    return res.status(200).send(user);

});

router.put("/:id", async(req, res) => {

    await connectDB()
    const user = await User.findByIdAndUpdate(req.params.id,
        {
            email:      req.body.email.toUpperCase(),
            nome:       req.body.nome.toUpperCase(),
            senha:      req.body.senha,
            telefone:   req.body.telefone,
            situacao:   req.body.situacao ? req.body.situacao.toUpperCase() : 'ATIVO',
            companys:   req.body.companys
        },
        {new: true}
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