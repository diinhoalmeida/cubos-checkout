const fs = require('fs/promises');
const addBusinessDays = require('date-fns/addBusinessDays');
const format = require('date-fns/format');

let carrinho = {
    subtotal: 0,
    dataDeEntrega: null,
    valorDoFrete: 0,
    totalAPagar: 0,
    produtos: []
}

async function adicionandoAoCarrinho(req, res) {
    const listaDeProdutos = JSON.parse(await fs.readFile('./data.json'));
    const listaDeProdutosProdutos = listaDeProdutos.produtos;
    const { id, quantidade } = req.body;
    const avaliarEstoque = listaDeProdutosProdutos.find(produto => produto.id === id && produto.estoque >= quantidade);

    if (!avaliarEstoque) {
        res.json('ID não encontrado ou sem quantidade em estoque.');
    }
    //Tratando novo produto
    newProduto.id = avaliarEstoque.id;
    newProduto.quantidade = quantidade;
    newProduto.nome = avaliarEstoque.nome;
    newProduto.preco = avaliarEstoque.preco;
    newProduto.categoria = avaliarEstoque.categoria;

    //Tratando carrinho

    for (let produto of carrinho.produtos) {
        carrinho.subtotal += produto.quantidade * produto.preco;
    }

    carrinho.dataDeEntrega = addBusinessDays(new Date, 15);
    carrinho.valorDoFrete = carrinho.subtotal < 20000? 5000: 0;
    carrinho.totalAPagar = carrinho.subtotal + carrinho.valorDoFrete;
    carrinho.produtos.push(newProduto);

    res.json(carrinho);
};

async function consultarProdutos(req, res) {
    const listaDeProdutos = JSON.parse(await fs.readFile('./data.json'));
    const dentroDosProdutos = listaDeProdutos.produtos;
    let categoria = req.query.categoria;
    let precoInicial = Number(req.query.precoInicial);
    let precoFinal = Number(req.query.precoFinal);
    
    //Tratamento do Categoria
    if (categoria) {
        categoria = categoria.slice(0, 1).toUpperCase() + categoria.slice(1).toLowerCase();    
    }

    //Condições de Resposta ao Usuário
    if (!categoria && !precoInicial && !precoFinal) {
        res.json(dentroDosProdutos);       
    }
    if (categoria && precoInicial && precoFinal) {
        const produtosFiltrados = dentroDosProdutos.filter(itens => 
            itens.categoria === categoria 
            && itens.preco > precoInicial 
            && itens.preco < precoFinal);
        res.json(produtosFiltrados);
    }
    if (categoria && !precoInicial && !precoFinal) {
        const produtosFiltrados = dentroDosProdutos.filter(itens => 
            itens.categoria === categoria);
        res.json(produtosFiltrados);    
    }
    if (!categoria && precoInicial && precoFinal) {
        const produtosFiltrados = dentroDosProdutos.filter(itens =>  
            itens.preco > precoInicial 
            && itens.preco < precoFinal);
        res.json(produtosFiltrados);    
    }
};

async function consultarCarrinho(req, res) {
    res.json(carrinho);
};

async function alterarQuantidade(req, res) {
    const listaDeProdutos = JSON.parse(await fs.readFile('./data.json'));
    const listaDeProdutosProdutos = listaDeProdutos.produtos;
    const idDoProduto = Number(req.params.idProduto);
    const { quantidade } = req.body;

    const avaliarEstoque = listaDeProdutosProdutos.find(produto => produto.id === idDoProduto);
    const avaliarCarrinho = carrinho.produtos.find(produto => produto.id === idDoProduto);

    if(!avaliarCarrinho) {
        res.json('Não foi possível encontrar o ID no carrinho.');
    }
    if (avaliarEstoque.estoque + quantidade > avaliarEstoque.estoque) {
        res.json('Não há quantidade disponivel para ser adicionado.');
    }

    let produtoEditado = carrinho;

    if (quantidade < 0) {
        carrinho.subtotal = carrinho.subtotal - avaliarEstoque.preco*quantidade;    
    }
    carrinho.subtotal = carrinho.subtotal + avaliarEstoque.preco*quantidade;
    carrinho.dataDeEntrega = addBusinessDays(new Date, 15);
    carrinho.valorDoFrete = carrinho.totalAPagar < 20000? 5000: 0;
    carrinho.totalAPagar = carrinho.totalAPagar + carrinho.subtotal;


    
    
}



module.exports = { adicionandoAoCarrinho, 
                   carrinho,
                   consultarProdutos, 
                   consultarCarrinho };
