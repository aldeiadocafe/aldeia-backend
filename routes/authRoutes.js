require('dotenv').config()    // Carrega as variáveis do .env

const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User'); // Modelo Mongoose
const router = express.Router();

router.post("/", async (req, res) => {

  const { email, senha } = req.body;

  // 1. Verificar se usuário existe no MongoDB
  const user = await User.findOne({ email: email });
  if (!user) return res.status(400).json({ message: 'Usuário inválido' });

  // 2. Validar a senha
  const validPass = await bcrypt.compare(senha, user.senha);
  if (!validPass) return res.status(400).json({ message: 'Senha inválidas' });


  // 3. Gerar JWT
  const token = jwt.sign({ _id: user._id }, 
                          process.env.JWT_SECRET, 
                          { expiresIn: '1h' });
  
  // 4. Enviar token
  res.header('auth-token', token).json({ token, user: { id: user._id, nome: user.nome } });
  
});

module.exports = router;
