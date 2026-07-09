// Array global que vai guardar os produtos básicos
let listaProdutos = [];
// Objeto global para armazenar as instâncias dos gráficos
let graficosValores = {};

// Evento disparado assim que a página carrega
window.onload = function() {
    carregarDados();
};

// Função para renderizar os produtos na tela com base na listaProdutos
function renderizarProdutos() {
    const container = document.getElementById('container-produtos');
    container.innerHTML = ''; // Limpa o container para reconstruir

    if (listaProdutos.length === 0) {
        // Inicializa com o Produto 1 padrão caso esteja vazio
        listaProdutos.push({ id: 1, nome: '', compra: '', quantidade: 1, lucro: '', venda: '' });
    }

    listaProdutos.forEach((prod, index) => {
        const novoProdutoDiv = document.createElement('div');
        novoProdutoDiv.classList.add('produto-item');
        novoProdutoDiv.id = `produto-${prod.id}`;

        const botaoRemover = index > 0 
            ? `<button class="btn-remover" onclick="removerProduto(${prod.id})">Remover</button>` 
            : '';

        // Garante que se a quantidade não existir (dados antigos), comece em 1
        const qtdAtual = prod.quantidade || 1;

        novoProdutoDiv.innerHTML = `
            ${index > 0 ? '<hr>' : ''}
            <h2>Produto ${prod.id}:</h2>
            
            <label>Nome do produto:</label>
            <input type="text" class="nome-produto" value="${prod.nome}" oninput="atualizarDadosMemoria(${prod.id})">
            
            <div style="display: flex; gap: 12px;">
                <div style="flex: 1;">
                    <label>Preço de compra (Total):</label>
                    <input type="number" class="preco-compra" step="0.01" value="${prod.compra}" oninput="atualizarDadosMemoria(${prod.id})">
                </div>
                <div style="width: 100px;">
                    <label>Quantidade:</label>
                    <input type="number" class="quantidade-compra" min="1" value="${qtdAtual}" oninput="atualizarDadosMemoria(${prod.id})">
                </div>
            </div>
            
            <label>Lucro desejado (%):</label>
            <input type="number" class="lucro-desejado" step="0.01" value="${prod.lucro}" oninput="atualizarDadosMemoria(${prod.id})">
            
            <label>Preço de venda (Unitário):</label>
            <input type="number" class="preco-venda" step="0.01" value="${prod.venda}" readonly>
            
            <div class="acoes-botoes" style="display: flex; gap: 12px; margin-top: 8px;">
                <button class="btn-calcular" onclick="calculate(${prod.id})">Calcular</button>
                ${botaoRemover}
            </div>

            <div class="container-grafico" style="margin-top: 20px; max-height: 220px; display: none;" id="zona-grafico-${prod.id}">
                <canvas id="grafico-${prod.id}"></canvas>
            </div>
        `;

        container.appendChild(novoProdutoDiv);

        // Se o produto já continha cálculo anterior, monta o gráfico ao iniciar
        if (prod.venda) {
            gerarGrafico(prod.id);
        }
    });
}

// Adiciona um novo produto na lista e redesenha a tela
function adicionarProduto() {
    const novoId = listaProdutos.length > 0 ? Math.max(...listaProdutos.map(p => p.id)) + 1 : 1;
    listaProdutos.push({ id: novoId, nome: '', compra: '', quantidade: 1, lucro: '', venda: '' });
    salvarDados();
    renderizarProdutos();
}

// Remove o produto da lista e destrói o gráfico correspondente
function removerProduto(idProduto) {
    if (graficosValores[idProduto]) {
        graficosValores[idProduto].destroy();
        delete graficosValores[idProduto];
    }
    listaProdutos = listaProdutos.filter(p => p.id !== idProduto);
    salvarDados();
    renderizarProdutos();
}

// Salva as inputs que estão sendo digitadas diretamente na memória do Array
function atualizarDadosMemoria(idProduto) {
    const blocoProduto = document.getElementById(`produto-${idProduto}`);
    const produto = listaProdutos.find(p => p.id === idProduto);

    if (produto && blocoProduto) {
        produto.nome = blocoProduto.querySelector('.nome-produto').value;
        produto.compra = blocoProduto.querySelector('.preco-compra').value;
        
        let qtd = parseInt(blocoProduto.querySelector('.quantidade-compra').value);
        produto.quantidade = isNaN(qtd) || qtd < 1 ? 1 : qtd; // Evita valores inválidos ou zero
        
        produto.lucro = blocoProduto.querySelector('.lucro-desejado').value;
        salvarDados(); // Grava alterações temporárias no LocalStorage
    }
}

// Calcula o preço básico baseado na unidade, salva e dispara o gráfico
function calculate(idProduto) {
    const blocoProduto = document.getElementById(`produto-${idProduto}`);
    const produto = listaProdutos.find(p => p.id === idProduto);

    if (!produto || !blocoProduto) return;

    const precoCompraTotal = parseFloat(produto.compra);
    const quantidade = parseInt(produto.quantidade) || 1;
    const percentualLucro = parseFloat(produto.lucro);
    
    if (isNaN(precoCompraTotal) || isNaN(percentualLucro)) {
        alert(`Por favor, preencha todos os campos do produto corretamente.`);
        return;
    }
    
    // Calcula o preço de compra por unidade antes de aplicar o lucro
    const precoCompraUnitario = precoCompraTotal / quantidade;
    const precoVendaUnitario = precoCompraUnitario + (precoCompraUnitario * (percentualLucro / 100));
    
    // Atualiza o objeto e a tela
    produto.venda = precoVendaUnitario.toFixed(2);
    blocoProduto.querySelector('.preco-venda').value = produto.venda;
    
    salvarDados();
    gerarGrafico(idProduto);
}

// Cria/Atualiza o gráfico simplificado usando o Chart.js
function gerarGrafico(idProduto) {
    const produto = listaProdutos.find(p => p.id === idProduto);
    if (!produto) return;

    const divGrafico = document.getElementById(`zona-grafico-${idProduto}`);
    divGrafico.style.display = "block"; // Torna visível

    const ctxCanvas = document.getElementById(`grafico-${idProduto}`).getContext('2d');

    const precoCompraTotal = parseFloat(produto.compra) || 0;
    const quantidade = parseInt(produto.quantidade) || 1;
    
    // Gráfico agora reflete os valores baseados na unidade
    const precoCompraUnitario = precoCompraTotal / quantidade;
    const lucroEmDinheiroUnitario = (precoCompraUnitario * (parseFloat(produto.lucro) / 100)) || 0;

    // Se já havia um gráfico gerado ali, limpa para não sobrepor
    if (graficosValores[idProduto]) {
        graficosValores[idProduto].destroy();
    }

    // Configura o gráfico de rosca (doughnut) integrado à paleta de cores
    graficosValores[idProduto] = new Chart(ctxCanvas, {
        type: 'doughnut',
        data: {
            labels: ['Custo Unitário', 'Lucro Unitário'],
            datasets: [{
                data: [precoCompraUnitario, lucroEmDinheiroUnitario],
                backgroundColor: [
                    '#1a1a1a', // Preto (Preço de compra unitário)
                    '#e60000'  // Vermelho Mertopel (Lucro unitário)
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        color: '#212529',
                        font: { weight: 'bold' }
                    }
                }
            }
        }
    });
}

// Salva o Array completo convertido para texto JSON
function salvarDados() {
    localStorage.setItem('mertopel_produtos_basicos', JSON.stringify(listaProdutos));
}

// Puxa o JSON do navegador de volta para o Array
function carregarDados() {
    const dadosSalvos = localStorage.getItem('mertopel_produtos_basicos');
    if (dadosSalvos) {
        listaProdutos = JSON.parse(dadosSalvos);
    }
    renderizarProdutos();
}
