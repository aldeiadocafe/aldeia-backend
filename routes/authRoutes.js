require('dotenv').config()    // Carrega as variáveis do .env

const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User'); // Modelo Mongoose
const router = express.Router();

router.post("/", async (req, res) => {

  const { email, senha } = req.body;

  let user
console.log("email", process.env.ADMIN_EMAIL)
console.log("senha", process.env.ADMIN_PASSWORD)
  //Verifica se é usuario Admin
  if (email.toUpperCase() === process.env.ADMIN_EMAIL
      && senha === process.env.ADMIN_PASSWORD) {

    //Se não existir, cria registro user
    user = await User.findOne({ email: email.toUpperCase() });

    if (!user) {

      // 1. Gerar salt e hash (10 é o custo padrão/recomendado)
      const hashedPassword = await bcrypt.hash(req.body.senha, 10);

      let user = new User({
          email:      email.toUpperCase(),
          nome:       email.toUpperCase(),
          senha:      hashedPassword,
          situacao:   'ATIVO',
      });

      user = await user.save();

    }

  } else {

    // 1. Verificar se usuário existe no MongoDB
    user = await User.findOne({ email: email })
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
