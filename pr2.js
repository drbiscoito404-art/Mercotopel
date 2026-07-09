// Array global que vai guardar todos os nossos produtos
let listaProdutos = [];
// Objeto global para guardar as instâncias dos gráficos e podermos atualizá-los
let graficosValores = {};

// Evento que roda automaticamente assim que a página carrega
window.onload = function() {
    carregarDados();
};

// Função para renderizar (desenhar) os produtos na tela com base na listaProdutos
function renderizarProdutos() {
    const container = document.getElementById('container-produtos');
    container.innerHTML = ''; // Limpa o container para recriar do zero

    if (listaProdutos.length === 0) {
        listaProdutos.push({ id: 1, nome: '', compra: '', quantidade: 1, fabricacao: '', frete: '', lucro: '', venda: '' });
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
                    <label>Valor de itens comprado (Total):</label>
                    <input type="number" class="preco-compra" step="0.01" value="${prod.compra}" oninput="atualizarDadosMemoria(${prod.id})">
                </div>
                <div style="width: 100px;">
                    <label>Quantidade:</label>
                    <input type="number" class="quantidade-compra" min="1" value="${qtdAtual}" oninput="atualizarDadosMemoria(${prod.id})">
                </div>
            </div>
            
            <label>Custo de fabricação (Total):</label>
            <input type="number" class="custo-fabricacao" step="0.01" value="${prod.fabricacao}" oninput="atualizarDadosMemoria(${prod.id})">

            <label>Valor do frete (Total):</label>
            <input type="number" class="valor-frete" step="0.01" value="${prod.frete}" oninput="atualizarDadosMemoria(${prod.id})">
            
            <label>Lucro desejado (%):</label>
            <input type="number" class="lucro-desejado" step="0.01" value="${prod.lucro}" oninput="atualizarDadosMemoria(${prod.id})">

            <label>Preço de venda (Unitário):</label>
            <input type="number" class="preco-venda" step="0.01" value="${prod.venda}" readonly>
            
            <div class="acoes-botoes">
                <button class="btn-calcular" onclick="calculate(${prod.id})">Calcular</button>
                ${botaoRemover}
            </div>

            <div class="container-grafico" style="margin-top: 20px; max-height: 250px; display: none;" id="zona-grafico-${prod.id}">
                <canvas id="grafico-${prod.id}"></canvas>
            </div>
        `;

        container.appendChild(novoProdutoDiv);

        // Se o produto já tinha um cálculo salvo anteriormente, gera o gráfico dele logo na inicialização
        if (prod.venda) {
            gerarGrafico(prod.id);
        }
    });
}

// Adiciona um novo produto na lista e atualiza a tela
function adicionarProduto() {
    const novoId = listaProdutos.length > 0 ? Math.max(...listaProdutos.map(p => p.id)) + 1 : 1;
    listaProdutos.push({ id: novoId, nome: '', compra: '', quantidade: 1, fabricacao: '', frete: '', lucro: '', venda: '' });
    salvarDados();
    renderizarProdutos();
}

// Remove o produto da lista e do gerenciador de gráficos
function removerProduto(idProduto) {
    if (graficosValores[idProduto]) {
        graficosValores[idProduto].destroy();
        delete graficosValores[idProduto];
    }
    listaProdutos = listaProdutos.filter(p => p.id !== idProduto);
    salvarDados();
    renderizarProdutos();
}

// Salva o que o usuário está digitando direto na memória (Array)
function atualizarDadosMemoria(idProduto) {
    const blocoProduto = document.getElementById(`produto-${idProduto}`);
    const produto = listaProdutos.find(p => p.id === idProduto);

    if (produto && blocoProduto) {
        produto.nome = blocoProduto.querySelector('.nome-produto').value;
        produto.compra = blocoProduto.querySelector('.preco-compra').value;
        
        let qtd = parseInt(blocoProduto.querySelector('.quantidade-compra').value);
        produto.quantidade = isNaN(qtd) || qtd < 1 ? 1 : qtd; // Proteção contra valores nulos/menores que 1
        
        produto.fabricacao = blocoProduto.querySelector('.custo-fabricacao').value;
        produto.frete = blocoProduto.querySelector('.valor-frete').value;
        produto.lucro = blocoProduto.querySelector('.lucro-desejado').value;
        salvarDados();
    }
}

// Calcula o valor unitário, salva o resultado final e dispara o gráfico
function calculate(idProduto) {
    const blocoProduto = document.getElementById(`produto-${idProduto}`);
    const produto = listaProdutos.find(p => p.id === idProduto);

    if (!produto || !blocoProduto) return;

    const precoCompraTotal = parseFloat(produto.compra) || 0;
    const custoFabricacaoTotal = parseFloat(produto.fabricacao) || 0;
    const valorFreteTotal = parseFloat(produto.frete) || 0;
    const percentualLucro = parseFloat(produto.lucro) || 0;
    const quantidade = parseInt(produto.quantidade) || 1;
    
    if (precoCompraTotal === 0 && custoFabricacaoTotal === 0) {
        alert(`Por favor, insira os valores de custo.`);
        return;
    }
    
    // Transforma os custos totais informados em custos por unidade
    const compraUnitario = precoCompraTotal / quantidade;
    const fabricacaoUnitario = custoFabricacaoTotal / quantidade;
    const freteUnitario = valorFreteTotal / quantidade;

    const custoTotalUnitario = compraUnitario + fabricacaoUnitario + freteUnitario;
    const precoVendaUnitario = custoTotalUnitario + (custoTotalUnitario * (percentualLucro / 100));
    
    produto.venda = precoVendaUnitario.toFixed(2);
    blocoProduto.querySelector('.preco-venda').value = produto.venda;
    
    salvarDados();
    
    // Ativa e desenha o gráfico com os novos valores calculados
    gerarGrafico(idProduto);
}

// Função responsável por criar/atualizar o gráfico usando Chart.js
function gerarGrafico(idProduto) {
    const produto = listaProdutos.find(p => p.id === idProduto);
    if (!produto) return;

    const divGrafico = document.getElementById(`zona-grafico-${idProduto}`);
    divGrafico.style.display = "block"; // Torna o gráfico visível

    const ctxCanvas = document.getElementById(`grafico-${idProduto}`).getContext('2d');

    const precoCompraTotal = parseFloat(produto.compra) || 0;
    const custoFabricacaoTotal = parseFloat(produto.fabricacao) || 0;
    const valorFreteTotal = parseFloat(produto.frete) || 0;
    const quantidade = parseInt(produto.quantidade) || 1;
    
    // Divide os valores para que o gráfico exiba o peso de cada custo por unidade
    const compraUnitario = precoCompraTotal / quantidade;
    const fabricacaoUnitario = custoFabricacaoTotal / quantidade;
    const freteUnitario = valorFreteTotal / quantidade;
    
    const custoTotalUnitario = compraUnitario + fabricacaoUnitario + freteUnitario;
    const lucroEmDinheiroUnitario = (custoTotalUnitario * (parseFloat(produto.lucro) / 100)) || 0;

    // Se o gráfico já existia nesse produto, destrói para criar o novo atualizado
    if (graficosValores[idProduto]) {
        graficosValores[idProduto].destroy();
    }

    // Cria o gráfico de pizza (doughnut) estilizado focado nos valores unitários
    graficosValores[idProduto] = new Chart(ctxCanvas, {
        type: 'doughnut',
        data: {
            labels: ['Compra (Unit.)', 'Fabricação (Unit.)', 'Frete (Unit.)', 'Lucro Real (Unit.)'],
            datasets: [{
                data: [compraUnitario, fabricacaoUnitario, freteUnitario, lucroEmDinheiroUnitario],
                backgroundColor: [
                    '#495057', // Cinza escuro (Compra)
                    '#1a1a1a', // Preto (Fabricação)
                    '#ced4da', // Cinza claro (Frete)
                    '#e60000'  // Vermelho Mertopel (Lucro)
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

// Função para gravar no LocalStorage do navegador
function salvarDados() {
    localStorage.setItem('mertopel_produtos', JSON.stringify(listaProdutos));
}

// Função para puxar os dados do LocalStorage ao abrir o site
function carregarDados() {
    const dadosSalvos = localStorage.getItem('mertopel_produtos');
    if (dadosSalvos) {
        listaProdutos = JSON.parse(dadosSalvos);
    }
    renderizarProdutos();
}
