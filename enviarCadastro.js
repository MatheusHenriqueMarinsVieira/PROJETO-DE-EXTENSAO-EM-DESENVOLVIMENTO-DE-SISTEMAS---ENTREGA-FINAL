const fetch = require("node-fetch");

async function cadastrarUsuario() {
    const dados = {
        nome_completo: "Moises Muniz",
        login: "muniz123",
        cpf: "12345678900",
        email: "teste@gmail.com",
        data_nascimento: "2000-01-01",
        senha: "1234"
    };

    const resposta = await fetch("http://localhost:3000/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados)
    });

    console.log("Resposta:", await resposta.text());
}

cadastrarUsuario();
