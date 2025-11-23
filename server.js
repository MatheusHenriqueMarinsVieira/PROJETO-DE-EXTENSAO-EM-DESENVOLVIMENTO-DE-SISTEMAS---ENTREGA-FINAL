const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const path = require("path");

const app = express();
app.use(express.json());
app.use(cors());

// === SERVIR ARQUIVOS ESTÁTICOS ===
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// === CONFIGURAÇÃO DO BANCO ===
const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "MinhaSenhaForte123",
  database: "vinilexpress",
  port: 3306,
  connectionLimit: 10
});

function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
}

query("SELECT 1")
  .then(() => console.log("MySQL conectado!"))
  .catch(err => console.error("Erro MySQL:", err.message));

// =====================
// ROTAS API
// =====================

// ---------------------
// Cadastro
// ---------------------
app.post("/register", async (req, res) => {
  try {
    const { nome, cpf, email, data_nascimento, senha } = req.body;

    if (!email || !senha || !nome)
      return res.status(400).json({ erro: "nome, email e senha são obrigatórios" });

    const exists = await query("SELECT id FROM usuarios WHERE email = ?", [email]);
    if (exists.length > 0)
      return res.status(409).json({ erro: "Email já cadastrado" });

    const salt = await bcrypt.genSalt(10);
    const senha_hash = await bcrypt.hash(senha, salt);

    const result = await query(
      "INSERT INTO usuarios (nome, cpf, email, data_nascimento, senha_hash) VALUES (?, ?, ?, ?, ?)",
      [nome, cpf || null, email, data_nascimento || null, senha_hash]
    );

    res.status(201).json({ mensagem: "Usuário cadastrado", id: result.insertId });
  } catch (err) {
    res.status(500).json({ erro: "Erro ao cadastrar usuário", detalhes: err.message });
  }
});

// ---------------------
// Login
// ---------------------
app.post("/login", async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha)
      return res.status(400).json({ erro: "email e senha são obrigatórios" });

    const rows = await query("SELECT id, nome, senha_hash FROM usuarios WHERE email = ?", [email]);

    if (rows.length === 0)
      return res.status(401).json({ erro: "Email ou senha incorretos" });

    const user = rows[0];
    const senhaOk = await bcrypt.compare(senha, user.senha_hash);

    if (!senhaOk)
      return res.status(401).json({ erro: "Email ou senha incorretos" });

    res.json({
      mensagem: "Login realizado",
      usuario: { id: user.id, nome: user.nome, email }
    });

  } catch (err) {
    res.status(500).json({ erro: "Erro ao realizar login", detalhes: err.message });
  }
});

// ================================
// FAVORITOS (NOVO SISTEMA ATUALIZADO)
// ================================

// -----------------------------
// ADICIONAR FAVORITO
// -----------------------------
app.post("/favoritos", async (req, res) => {
  const { usuario_id, disco_id } = req.body;

  if (!usuario_id || !disco_id) {
    return res.status(400).json({ erro: "usuario_id e disco_id são obrigatórios" });
  }

  try {
    // Impedir duplicados
    const existe = await query(
      "SELECT id FROM favoritos WHERE usuario_id = ? AND disco_id = ?",
      [usuario_id, disco_id]
    );

    if (existe.length > 0) {
      return res.status(409).json({ erro: "Disco já está nos favoritos" });
    }

    await query(
      "INSERT INTO favoritos (usuario_id, disco_id) VALUES (?, ?)",
      [usuario_id, disco_id]
    );

    res.status(201).json({ mensagem: "Favorito adicionado!" });

  } catch (erro) {
    res.status(500).json({ erro: "Erro ao adicionar favorito", detalhes: erro.message });
  }
});

// -----------------------------
// LISTAR FAVORITOS COM JOIN
// -----------------------------
app.get("/favoritos/:usuario_id", async (req, res) => {
  const { usuario_id } = req.params;

  try {
    const favoritos = await query(
      `SELECT 
          favoritos.id AS favorito_id,
          discos.id AS disco_id,
          discos.nome AS nome_disco,
          discos.artista,
          discos.descricao,
          discos.capa_url
        FROM favoritos
        JOIN discos ON discos.id = favoritos.disco_id
        WHERE favoritos.usuario_id = ?
        ORDER BY favoritos.id DESC`,
      [usuario_id]
    );

    res.json(favoritos);

  } catch (erro) {
    res.status(500).json({ erro: "Erro ao buscar favoritos", detalhes: erro.message });
  }
});

// -----------------------------
// REMOVER FAVORITO
// -----------------------------
app.delete("/favoritos/:favorito_id", async (req, res) => {
  const { favorito_id } = req.params;

  try {
    const result = await query("DELETE FROM favoritos WHERE id = ?", [favorito_id]);

    if (result.affectedRows === 0)
      return res.status(404).json({ erro: "Favorito não encontrado" });

    res.json({ mensagem: "Favorito removido" });

  } catch (erro) {
    res.status(500).json({ erro: "Erro ao remover favorito", detalhes: erro.message });
  }
});

// -----------------------------
// BUSCAR DADOS DO USUÁRIO
// -----------------------------
app.get("/usuarios/:id", async (req, res) => {
  try {
    const rows = await query(
      "SELECT id, nome, email, cpf, data_nascimento, criado_em FROM usuarios WHERE id = ?",
      [req.params.id]
    );

    if (rows.length === 0)
      return res.status(404).json({ erro: "Usuário não encontrado" });

    res.json(rows[0]);

  } catch (err) {
    res.status(500).json({ erro: "Erro ao buscar usuário", detalhes: err.message });
  }
});

// ================================
// START SERVER
// ================================
const PORT = 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
