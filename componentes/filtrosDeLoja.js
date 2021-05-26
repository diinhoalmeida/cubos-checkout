function filtrarCategoria(listarProdutos, categoria) {
    return listarProdutos.produtos.filter(produtos => produtos.categoria === categoria);
}

function filtrarPrecoInicial(listarProdutos, precoInicial) {
    return listarProdutos.produtos.filter(produtos => produtos.preco >= precoInicial);
}

function filtrarPrecoFinal(listarProdutos, precoFinal) {
    return listarProdutos.produtos.filter(produtos => produtos.preco <= precoFinal);
}

function verificandoIdNaLoja(id, listarProdutos) {
    const produtoEncontrado = listarProdutos.produtos.find(produto => produto.id === id);
    return produtoEncontrado;
}

function validandoEstoque(listarProdutos, carrinho) {
    const quantidadeCarrinho = carrinho.produtos.length;
    let confirmandoQuantidadeDoCarrinho = [];

    for (const item of carrinho.produtos) {
        for (const item2 of listarProdutos.produtos) {
            if (item.id === item2.id) {
                if (item.quantidade < item2.estoque) {
                    confirmandoQuantidadeDoCarrinho.push(item);
                }
            }
        }
    }

    return quantidadeCarrinho === confirmandoQuantidadeDoCarrinho.length? true: false;
}

function abatendoProdutosNoEstoque(listarProdutos, carrinho) {
    let newListarProdutos = listarProdutos;
    carrinho.produtos.map(item => {
        for (let itemLoja of newListarProdutos.produtos) {
            if (item.id === itemLoja.id) {
                itemLoja.estoque -= item.quantidade;
                break;
            }
        }
    })

    return newListarProdutos;
}


//     const type = req.body.type;
//     const country = req.body.country;
//     const name = req.body.name;
//     const documents = req.body.documents;



module.exports = { 
    filtrarCategoria,
    filtrarPrecoInicial,
    filtrarPrecoFinal,
    verificandoIdNaLoja,
    validandoEstoque,
    abatendoProdutosNoEstoque };