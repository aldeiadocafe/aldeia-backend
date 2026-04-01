require('dotenv').config()    // Carrega as variáveis do .env

const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User'); // Modelo Mongoose
const router = express.Router();

router.post("/", async (req, res) => {

  const { nome, senha } = req.body;

  let user
  
  //Verifica se é usuario Admin
  if (nome.toUpperCase() === process.env.ADMIN_NOME
      && senha === process.env.ADMIN_PASSWORD) {

    try{ 

      //Se não existir, cria registro user
      user = await User.findOne({ nome: nome.toUpperCase() });

      if (!user) {

        // 1. Gerar salt e hash (10 é o custo padrão/recomendado)
        const hashedPassword = await bcrypt.hash(req.body.senha, 10);

        let user = new User({
            nome:       nome.toUpperCase(),
            email:      nome.toUpperCase(),
            senha:      hashedPassword,
            situacao:   'ATIVO',
        });

        user = await user.save();

      }

    } catch (error) {

      // ESSENCIAL: Logar o erro no terminal do servidor
      console.error("Erro no Mongoose:", error);

      // Retornar o erro para o React
      res.status(500).json({ 
          message: 'Erro ao atualizar no banco de dados', 
          error: error.message 
      });

    }

  } else {

    // 1. Verificar se usuário existe no MongoDB
    user = await User.findOne({ nome: nome })
                    .populate([
                        { path: "empresas", select: 'nome' },
                        { path: 'usuarioCriacao',   select: 'nome email'},
                        { path: 'usuarioAlteracao', select: 'nome email'},
                    ])
    if (!user) return res.status(400).json({ message: 'Usuário inválido' });

    if(user.situacao !== 'ATIVO') return res.status(403).json({ message: 'Usuário inativo' });

    // 2. Validar a senha
    const validPass = await bcrypt.compare(senha, user.senha);
    if (!validPass) return res.status(400).json({ message: 'Senha inválidas' });

  }

  // 3. Gerar JWT
  const token = jwt.sign({ _id: user._id }, 
                          process.env.JWT_SECRET, 
                          { expiresIn: '1h' });
  
  // 4. Enviar token
//  res.header('auth-token', token).json({ token, user: { id: user._id, nome: user.nome } });
  res.header('auth-token', token).json({ token, user });
  
});

module.exports = router;
