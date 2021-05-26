const express = require('express');
const { 
    listarProdutos, 
    detalhandoCarrinho,
    adicionandoAoCarrinho,
    editandoQuantidade,
    deletandoItem,
    limpandoCarrinho,
    confirmandoCompra } = require('./componentes/controladores.js');

const router = express();

router.get('/produtos', listarProdutos);
router.get('/carrinho', detalhandoCarrinho);
router.post('/carrinho/produtos', adicionandoAoCarrinho);
router.patch('/carrinho/produtos/:idProduto', editandoQuantidade);
router.delete('/carrinho/produtos/:idProduto', deletandoItem);
router.delete('/carrinho', limpandoCarrinho);
router.post('/finalizar-compra', confirmandoCompra);

module.exports = router;