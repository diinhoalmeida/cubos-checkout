const addBusinessDays = require('date-fns/addBusinessDays');
const format = require('date-fns/format');

let carrinho = {
    subtotal: 0,
    dataDeEntrega: null,
    valorDoFrete: 0,
    totalAPagar: 0,
    produtos: []
}

function atualizandoCarrinho(carrinho) {
    carrinho.subtotal = 0;
    carrinho.dataDeEntrega = null;
    carrinho.valorDoFrete = 0;
    carrinho.totalAPagar = 0;

    for (const item of carrinho.produtos) {
        carrinho.subtotal += item.quantidade * item.preco;
    }
    carrinho.dataDeEntrega = carrinho.subtotal > 0? addBusinessDays(new Date, 15): null;
    carrinho.valorDoFrete = carrinho.subtotal > 0 && carrinho.subtotal < 20000? 5000: 0;
    carrinho.totalAPagar = carrinho.subtotal + carrinho.valorDoFrete;
}

function verificandoIdNoCarrinho(id, carrinho) {
    return carrinho.produtos.find(produto => produto.id === id);
}

async function deletandoItemDoCarrinho(carrinho, espaçoDoProduto) {
    carrinho.produtos.splice(carrinho.produtos[espaçoDoProduto], 1);
}


module.exports = {
    atualizandoCarrinho,
    carrinho,
    verificandoIdNoCarrinho,
    deletandoItemDoCarrinho };