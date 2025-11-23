// Verificar login
const usuarioId = localStorage.getItem("usuarioId");

if (!usuarioId) {
    document.getElementById("favoritos-lista").innerHTML = `
        <p style="text-align:center; font-size:22px; margin-top:40px;">
            Faça login para ver seus favoritos.
        </p>
    `;
    throw new Error("Usuário não logado");
}

// =============================================
// BUSCAR FAVORITOS DO USUÁRIO
// =============================================
async function carregarFavoritos() {
    try {
        const res = await fetch(`http://localhost:3000/favoritos/${usuarioId}`);

        if (!res.ok) {
            throw new Error("Erro ao buscar favoritos");
        }

        const lista = await res.json();
        const container = document.getElementById("favoritos-lista");

        // Se não houver favoritos
        if (lista.length === 0) {
            container.innerHTML = `
                <p style="text-align:center; font-size:22px; margin-top:40px;">
                    Você ainda não favoritou nenhum disco.
                </p>
            `;
            return;
        }

        // Montar os cards dos favoritos
        container.innerHTML = lista.map(fav => `
            <div class="favorito-item">
                <img src="${fav.capa_url}" alt="${fav.nome_disco}">
                <h3>${fav.nome_disco}</h3>
                <p>${fav.artista}</p>

                <button class="btn-remover" onclick="removerFavorito(${fav.favorito_id})">
                    Remover
                </button>
            </div>
        `).join("");

    } catch (erro) {
        console.error("Erro ao carregar favoritos:", erro);
    }
}

// =============================================
// REMOVER FAVORITO
// =============================================
async function removerFavorito(favoritoId) {
    if (!confirm("Deseja remover dos favoritos?")) return;

    try {
        const res = await fetch(`http://localhost:3000/favoritos/${favoritoId}`, {
            method: "DELETE"
        });

        if (!res.ok) {
            alert("Erro ao remover favorito.");
            return;
        }

        alert("Favorito removido!");
        carregarFavoritos(); // recarregar lista

    } catch (erro) {
        console.error("Erro ao remover favorito:", erro);
    }
}

// =============================================
// CHAMAR AO CARREGAR A PÁGINA
// =============================================
carregarFavoritos();
