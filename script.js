let cardContainer = document.querySelector(".card-container");
let campoBusca = document.querySelector("header input");
// NOVO: Seleciona a barra de filtros que criamos no index.html
let filterBar = document.querySelector(".filter-bar");
let dados = [];
let filtroAtivo = null; // Variável para rastrear o gênero selecionado

// Função principal que inicia a busca e o carregamento
async function iniciarBusca(origemDoClique = null) {
    const termoBusca = campoBusca.value.toLowerCase().trim();

    // Se a busca foi iniciada pelo botão e o campo está vazio, não faz nada.
    if (origemDoClique === 'botao' && termoBusca === '') {
        return;
    }

    // Se os dados ainda não foram carregados, busca do JSON.
    if (dados.length === 0) {
        try {
            let resposta = await fetch("data.json");
            dados = await resposta.json();
            // CHAMA A FUNÇÃO DE CRIAÇÃO DOS FILTROS APÓS CARREGAR OS DADOS
            renderizarFiltros();
        } catch (error) {
            console.error("Falha ao buscar dados:", error);
            return; 
        }
    }

    // LÓGICA DE FILTRAGEM
    let dadosFiltrados = dados.filter(dado => 
        dado.titulo.toLowerCase().includes(termoBusca) || 
        dado.autor.toLowerCase().includes(termoBusca) || 
        dado.sinopse.toLowerCase().includes(termoBusca) || 
        (dado.genero && dado.genero.some(g => g.toLowerCase().includes(termoBusca)))
    );

    // SE HOUVER UM FILTRO DE GÊNERO ATIVO, FILTRA NOVAMENTE
    if (filtroAtivo) {
        dadosFiltrados = dadosFiltrados.filter(dado => 
            dado.genero && dado.genero.includes(filtroAtivo)
        );
    }

    renderizarCards(dadosFiltrados);
}

// ----------------------------------------------------
// NOVO: Funções de Filtro de Gêneros
// ----------------------------------------------------

function extrairGenerosUnicos() {
    // Reduz todos os livros a um array único de gêneros (sem repetição)
    const todosGeneros = dados.reduce((acc, dado) => {
        if (dado.genero && Array.isArray(dado.genero)) {
            acc.push(...dado.genero);
        }
        return acc;
    }, []);
    
    // Retorna apenas os gêneros únicos, ordenados alfabeticamente
    return [...new Set(todosGeneros)].sort();
}

function renderizarFiltros() {
    const generos = extrairGenerosUnicos();
    filterBar.innerHTML = ''; // Limpa a barra antes de renderizar

    // Cria o botão "Todos"
    const btnTodos = criarBotaoFiltro('Todos', null);
    filterBar.appendChild(btnTodos);

    // Cria os botões para cada Gênero
    generos.forEach(genero => {
        const btn = criarBotaoFiltro(genero, genero);
        filterBar.appendChild(btn);
    });
}

function criarBotaoFiltro(texto, valorFiltro) {
    const button = document.createElement('button');
    button.textContent = texto;
    button.classList.add('filter-button');

    // Define o estado ativo se for o filtro atual
    if (filtroAtivo === valorFiltro) {
        button.classList.add('active');
    }
    
    // Adiciona o evento de clique
    button.onclick = () => {
        // Alterna o filtro: se for o mesmo, desativa. Se for novo, ativa.
        filtroAtivo = (filtroAtivo === valorFiltro) ? null : valorFiltro;
        
        // Remove a classe 'active' de todos os botões e adiciona ao botão atual
        document.querySelectorAll('.filter-button').forEach(btn => btn.classList.remove('active'));
        if (filtroAtivo) {
            button.classList.add('active');
        } else if (valorFiltro === null) {
            // Se for o botão 'Todos' e estiver desativando
            button.classList.add('active'); 
        }
        
        // Re-renderiza os cards com o novo filtro aplicado
        iniciarBusca();
        
        // Garante que o campo de busca seja limpo ao aplicar um filtro
        campoBusca.value = '';
    };
    
    // O botão "Todos" deve sempre estar ativo por padrão no carregamento inicial
    if (valorFiltro === null && filtroAtivo === null) {
         button.classList.add('active');
    }

    return button;
}

// ----------------------------------------------------
// Função de Renderização CORRIGIDA e Adaptada
// ----------------------------------------------------

function renderizarCards(dados) {
    cardContainer.innerHTML = ""; 

    if (dados.length === 0) {
         cardContainer.innerHTML = "<p style='text-align:center; color: var(--tertiary-color);'>Nenhum livro encontrado com o termo buscado ou filtro. Tente buscar por outro termo ou remova o filtro.</p>";
         return;
    }

    for (let dado of dados) {
        const tagsGeneros = dado.genero ? dado.genero.join(", ") : "Não informado";
        
        let article = document.createElement("article");
        article.classList.add("card");
        
        article.innerHTML = `
        <h2>${dado.titulo}</h2>
        <p><strong>Autor:</strong> ${dado.autor}</p>
        <p><strong>Publicação:</strong> ${dado.ano_publicacao}</p>
        <p><strong>Personagem Principal:</strong> ${dado.personagem_principal || 'Não listado'}</p>
        <p>${dado.sinopse}</p>
        
        <p class="genero-tags">
            <strong>Gêneros:</strong> ${tagsGeneros}
        </p>

        <a href="${dado.link}" target="_blank">Acessar PDF do Livro</a>
        `
        cardContainer.appendChild(article);
    }
}

// Inicializa a busca (e o carregamento dos dados e filtros)
iniciarBusca();