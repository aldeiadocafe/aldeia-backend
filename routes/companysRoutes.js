const express = require("express");
const router = express.Router();

const { connectDB } = require("../db/connectDB");
const Company = require("../models/Company");

// Criar Unidade
router.post("/", async(req, res) => {

    await connectDB()

    let company = new Company({
        cnpj:             res.body.cnpj,
        razaoSocial:      res.body.razaoSocial,      
        nome:             res.body.nome,             
        inscricaoEstadual:res.body.inscricaoEstadual,
        endereco:         res.body.endereco,
        numero:           res.body.numero,
        complemento:      res.body.complemento,
        cep:              res.body.cep,
        bairro:           res.body.bairro,
        municipio:        res.body.municipio,
        estado:           res.body.estado,
        email:            res.body.email,
        telefone:         res.body.telefone         
    });

    //Verificar se já existe a unidade
    const companyVerifica = await Unit.find({cnpj: req.body.cnpj});
    if(companyVerifica.length != 0) return res.status(404).send("CNPJ já cadastrada!");

    company = await company.save();

    if(!company) return res.status(400).send("Empresa não pode ser criada!");

    res.send(company);

});

router.get('/', async(req, res) => {

    await connectDB()

    const { cnpj, razaoSocial, nome } = req.query; // Pega os parâmetros da URL
    const filter = {};

    if (cnpj)           filter.cnpj         = cnpj;
    if (razaoSocial)    filter.razaoSocial  = razaoSocial;
    if (nome)           filter.nome         = nome;

    
    const companyList = await Company.find(filter)
                                     .sort({nome: 1});

    if(companyList.length === 0) {

        return res.status(404).json({message: "Empresa não encontrada."});

    };

    return res.status(200).send(companyList);

});

router.get("/:id", async (req, res) => {

    await connectDB()
    const company = await Company.findById(req.params.id);

    if (!company) {
        return res.status(404).json({message: "Empresa com Id não encontrado."});        
    };
    return res.status(200).send(company);

});

router.put("/:id", async(req, res) => {

    await connectDB()
    const company = await Company.findByIdAndUpdate(req.params.id,
        {
            cnpj:             res.body.cnpj,
            razaoSocial:      res.body.razaoSocial,      
            nome:             res.body.nome,             
            inscricaoEstadual:res.body.inscricaoEstadual,
            endereco:         res.body.endereco,
            numero:           res.body.numero,
            complemento:      res.body.complemento,
            cep:              res.body.cep,
            bairro:           res.body.bairro,
            municipio:        res.body.municipio,
            estado:           res.body.estado,
            email:            res.body.email,
            telefone:         res.body.telefone         
        },
        {new: true}
    );

    if (!company) {
        return res.status(400).send("A empresa não pode ser atualizada!");
    }

    return res.send(company);

});

router.delete("/:id", (req, res) => {

    Company.findByIdAndDelete(req.params.id)
        .then((company) => {
            if (company){
                return res.status(200).json({
                    success: true,
                    message: "Empresa eliminada!"
                });
            } else {
                return res.status(404).json({
                    success: false,
                    message: "Empresa não localizada!"
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