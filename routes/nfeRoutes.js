const express = require("express");
const router = express.Router();

const NFe = require("../models/Nfe");

// Criar
router.post("/", async(req, res) => {

    const dataEmissao = new Date(req.body.dataEmissao).toISOString().split('T')[0]

    let nfe = new NFe({        
        chave:          req.body.chave,  
        numero:         req.body.numero,
        serie:          req.body.serie,
        dataEmissao:    dataEmissao,
        aldeiaCnpj:     req.body.aldeiaCnpj,
        emitCnpj:       req.body.emitCnpj,
        emitNome:       req.body.emitNome,
        infCpl:         req.body.infCpl,
        valorTotal:     req.body.valorTotal,
        transpCnpj:     req.body.transpCnpj,
        transpNome:     req.body.transpNome,
        transpVolEsp:   req.body.transpVolEsp,
        transpVolnro:   req.body.transpVolnro,
        transpPesoBruto:req.body.transpPesoBruto,
        transpPesoLiq:  req.body.PesoLiq,
        transpVolQtde:  req.body.transpVolQtde
    });

    //Verificar se já existe
    const nfeVerifica = await NFe.find({chave: req.body.chave});
    if(nfeVerifica.length != 0) return res.status(404).send("Nota Fiscal já cadastrada!");

    nfe = await nfe.save();

    if(!nfe) return res.status(400).send("Nota Fiscal não pode ser criada!");

    res.send(nfe);

});

router.get('/', async(req, res) => {

    const { chave, numero, serie } = req.query; // Pega os parâmetros da URL
    const filter = {};

    if (chave)  filter.chave    = chave
    if (numero) filter.numero   = numero
    if (serie)  filter.serie    = serie
    
    const nfeList = await NFe.find(filter)
                            .sort({numero: 1,
                                   serie:  1});

    if(nfeList.length === 0) {

        return res.status(404).json({message: "Nota Fiscal não encontrada."});   

    };

    return res.status(200).send(nfeList);

});

router.get("/:id", async (req, res) => {

    const nfe = await NFe.findById(req.params.id);

    if (!nfe) {
        return res.status(404).json({message: "Nota Fiscal com Id não encontrado."});        
    };
    return res.status(200).send(nfe);

});

router.put("/:id", async(req, res) => {

    const dataEmissao = new Date(req.body.dataEmissao).toISOString().split('T')[0]

    const nfe = await NFe.findByIdAndUpdate(req.params.id,
        {
            chave:          req.body.chave,  
            numero:         req.body.numero,
            serie:          req.body.serie,
            dataEmissao:    dataEmissao,
            aldeiaCnpj:     req.body.aldeiaCnpj,
            emitCnpj:       req.body.emitCnpj,
            emitNome:       req.body.emitNome,
            infCpl:         req.body.infCpl,
            valorTotal:     req.body.valorTotal,
            transpCnpj:     req.body.transpCnpj,
            transpNome:     req.body.transpNome,
            transpVolEsp:   req.body.transpVolEsp,
            transpVolnro:   req.body.transp.Volnro,
            transpPesoBruto:req.body.transpPesoBruto,
            transpPesoLiq:  req.body.PesoLiq,
            transpVolQtde:  req.body.transpVolQtde
        },
        {new: true}
    );

    if (!nfe) {
        return res.status(400).send("Nota Fiscal não pode ser atualizada!");
    }

    return res.send(nfe);

});

router.delete("/:id", (req, res) => {
    NFe.findByIdAndDelete(req.params.id)
        .then((nfe) => {
            if (nfe){
                return res.status(200).json({
                    success: true,
                    message: "Nota Fiscal eliminada!"
                });
            } else {
                return res.status(404).json({
                    success: false,
                    message: "Nota Fiscal não localizada!"
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