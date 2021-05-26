const fs = require('fs/promises');

const { 
    carrinho,
    verificandoIdNoCarrinho,
    atualizandoCarrinho,
    deletandoItemDoCarrinho } = require('./controladoresCarrinho.js');
const { 
    filtrarCategoria,
    filtrarPrecoInicial,
    filtrarPrecoFinal,
    verificandoIdNaLoja,
    validandoEstoque,
    abatendoProdutosNoEstoque } = require('./filtrosDeLoja.js');

const { validandoDados } = require('./validandoDados.js');

async function listarProdutos(req, res) {
    const listarProdutos = JSON.parse(await fs.readFile('./data.json'));
    let categoria = req.query.categoria;
    const precoInicial = Number(req.query.precoInicial);
    const precoFinal = Number(req.query.precoFinal);
    let produtosFiltrados = listarProdutos.produtos;

    if (categoria) {
        categoria = categoria.slice(0, 1).toUpperCase()+categoria.slice(1).toLowerCase();
        produtosFiltrados = await filtrarCategoria(listarProdutos, categoria);
    }
    if (precoInicial) {
        produtosFiltrados = await filtrarPrecoInicial(listarProdutos, precoInicial);
    }
    if (precoFinal) {
        produtosFiltrados = await filtrarPrecoFinal(listarProdutos, precoFinal);
    }

    res.json(produtosFiltrados);
}

async function detalhandoCarrinho(req, res) {
    res.json(carrinho);
}

async function adicionandoAoCarrinho(req, res) {
    const listarProdutos = JSON.parse(await fs.readFile('./data.json'));
    const id = Number(req.body.id);
    const quantidade = Number(req.body.quantidade);
    const produtoValidadoId = await verificandoIdNaLoja(id, listarProdutos);
    const validandoQuantidade = produtoValidadoId? produtoValidadoId.estoque >= quantidade:null;
    const produtoNoCarrinho = await verificandoIdNoCarrinho(id, carrinho);

    if (!produtoValidadoId) {
        res.json(`Não foi possível encontrar o item referente a este ID.`);
    }
    if (!validandoQuantidade) {
        res.json(`Não há estoque disponível para o produto ${produtoValidadoId.nome}, a quantidade atual é de ${produtoValidadoId.estoque}`);
    }
    if (!produtoNoCarrinho && validandoQuantidade) {
        carrinho.produtos.push({
            id: produtoValidadoId.id,
            quantidade: quantidade,
            nome: produtoValidadoId.nome,
            preco: produtoValidadoId.preco,
            categoria: produtoValidadoId.categoria
        })
        atualizandoCarrinho(carrinho);
    }
    
    if (produtoNoCarrinho) {
        const espaçoDoProduto = carrinho.produtos.indexOf(produtoNoCarrinho);
        carrinho.produtos[espaçoDoProduto].quantidade += quantidade;
        atualizandoCarrinho(carrinho);
    }
    res.json(carrinho);
}

async function editandoQuantidade(req, res) {
    const listarProdutos = JSON.parse(await fs.readFile('./data.json'));
    const idDoProduto = Number(req.params.idProduto);
    const quantidade = Number(req.body.quantidade);
    const produtoValidadoId = await verificandoIdNaLoja(idDoProduto, listarProdutos);
    const produtoNoCarrinho = await verificandoIdNoCarrinho(idDoProduto, carrinho);    
    
    if (!produtoNoCarrinho) {
        res.json(`O item de ID ${idDoProduto} não foi adicionado.`);
    }
    if (quantidade > produtoValidadoId.estoque) {
        res.json(`Não há estoque disponível para o produto ${produtoValidadoId.nome}, a quantidade atual é de ${produtoValidadoId.estoque}`);
    }

    if (produtoNoCarrinho) {
        const espaçoDoProduto = carrinho.produtos.indexOf(produtoNoCarrinho);
        if (quantidade > 0) {
            carrinho.produtos[espaçoDoProduto].quantidade += quantidade;
        } 
        if (quantidade < 0 && produtoNoCarrinho.quantidade > 0) {
            carrinho.subtotal -= produtoNoCarrinho.preco; 
            carrinho.produtos[espaçoDoProduto].quantidade += quantidade;
            if (carrinho.produtos[espaçoDoProduto].quantidade < 1) {
                await deletandoItemDoCarrinho(carrinho, espaçoDoProduto);
            } 
        }    
    }
    
    atualizandoCarrinho(carrinho);

    res.json(carrinho);
}

async function deletandoItem(req, res) {
    const idDoProduto = Number(req.params.idProduto);
    const produtoNoCarrinho = await verificandoIdNoCarrinho(idDoProduto, carrinho);
    const espaçoDoProduto = carrinho.produtos.indexOf(produtoNoCarrinho);

    if (!produtoNoCarrinho) {
        res.json(`O produto não está no seu carrinho.`);
    }

    await deletandoItemDoCarrinho(carrinho, espaçoDoProduto);
    atualizandoCarrinho(carrinho);
    res.json(carrinho);

}

async function limpandoCarrinho(req, res) {
    carrinho.produtos = [];

    atualizandoCarrinho(carrinho);
    res.json(carrinho);
}

async function confirmandoCompra(req, res) {
    const listarProdutos = JSON.parse(await fs.readFile('./data.json'));

    if (carrinho.subtotal === 0) {
        res.json(`Não há itens adicionados ao carrinho.`);
    }

    let validandoQuantidadeDeProdutos = validandoEstoque(listarProdutos, carrinho);
    if (!validandoQuantidadeDeProdutos) {
        res.json(`Verifique a quantidade dos produtos em seu carrinho, algum excede o estoque.`);
    }

    const type = req.body.type;
    const country = req.body.country;
    const name = req.body.name.trim();
    const documents = req.body.documents[0].number;

    const validacaoDeDados = validandoDados(type, country, name, documents);
    if (validacaoDeDados) {
        res.json(validacaoDeDados);
    }

    let abaterProdutosEmEstoque = abatendoProdutosNoEstoque(listarProdutos, carrinho);
    await fs.writeFile("./data.json", JSON.stringify(abaterProdutosEmEstoque, null, 2));
    carrinho.produtos = [];
    atualizandoCarrinho(carrinho);
    res.json('Compra realizada com sucesso.');
}

module.exports = { 
    listarProdutos, 
    detalhandoCarrinho,
    adicionandoAoCarrinho,
    editandoQuantidade,
    deletandoItem,
    limpandoCarrinho,
    confirmandoCompra };