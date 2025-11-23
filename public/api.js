async function procurarCep() {
    const cep = document.getElementById('cep').value.replace(/\D/g, '');

    if (cep.length !== 8) {
        alert("CEP inválido! Digite 8 números.");
        return;
    }

    const url = `https://brasilapi.com.br/api/cep/v1/${cep}`;

    try {
        const resposta = await fetch(url);

        if (!resposta.ok) {
            alert("CEP não encontrado.");
            return;
        }

        const dados = await resposta.json();

        // Preenchendo automaticamente os campos do formulário
        document.getElementById("rua").value = dados.street || "";
        document.getElementById("bairro").value = dados.neighborhood || "";
        document.getElementById("cidade").value = dados.city || "";
        document.getElementById("estado").value = dados.state || "";

    } catch (erro) {
        alert("Erro ao buscar CEP. Tente novamente.");
        console.error(erro);
    }
}

window.onload = () => {
    const inputCep = document.getElementById("cep");
    inputCep.addEventListener("blur", procurarCep);
};
