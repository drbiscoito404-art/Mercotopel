// Contador que começa em 1, pois o primeiro já está na tela
let contadorProdutos = 1;

// Função para adicionar um novo produto na tela
function adicionarProduto() {
    contadorProdutos++; // Avança o número do produto (2, 3, 4...)

    // Seleciona o container principal
    const container = document.getElementById('container-produtos');

    // Cria uma nova div para o produto
    const novoProdutoDiv = document.createElement('div');
    novoProdutoDiv.classList.add('produto-item');
    novoProdutoDiv.id = `produto-${contadorProdutos}`;

    // HTML dinâmico com o campo "Nome do produto" adicionado
    novoProdutoDiv.innerHTML = `
        <hr> 
        <h2>Produto ${contadorProdutos}:</h2>
        
        <label>Nome do produto:</label>
        <input type="text" class="nome-produto">
        
        <label>Preço de compra:</label>
        <input type="number" class="preco-compra" step="0.01">
        
        <label>Lucro desejado (%):</label>
        <input type="number" class="lucro-desejado" step="0.01">
        
        <label>Preço de venda:</label>
        <input type="number" class="preco-venda" step="0.01" readonly>
        
        <button class="btn-calcular" onclick="calculate(${contadorProdutos})">Calcular</button>
        <button class="btn-remover" onclick="removerProduto(${contadorProdutos})">Remover</button>
    `;

    // Adiciona o novo produto dentro do container
    container.appendChild(novoProdutoDiv);
}

// Função para remover um produto específico
function removerProduto(idProduto) {
    // Busca o bloco do produto pelo ID
    const blocoProduto = document.getElementById(`produto-${idProduto}`);
    
    // Se o bloco existir, remove-o da tela
    if (blocoProduto) {
        blocoProduto.remove();
    }
}

// Função de calcular adaptada para cada produto específico
function calculate(idProduto) {
    const blocoProduto = document.getElementById(`produto-${idProduto}`);

    const precoCompraInput = blocoProduto.querySelector('.preco-compra');
    const lucroDesejadoInput = blocoProduto.querySelector('.lucro-desejado');
    const precoVendaInput = blocoProduto.querySelector('.preco-venda');

    const precoCompra = parseFloat(precoCompraInput.value);
    const percentualLucro = parseFloat(lucroDesejadoInput.value);
    
    if (isNaN(precoCompra) || isNaN(percentualLucro)) {
        alert(`Por favor, preencha todos os campos do Produto ${idProduto} corretamente.`);
        return;
    }
    
    const precoVenda = precoCompra + (precoCompra * (percentualLucro / 100));
    precoVendaInput.value = precoVenda.toFixed(2);
}
