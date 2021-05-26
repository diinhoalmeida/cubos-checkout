function validandoDados(type, country, name, documents) {
    if (type !== "individual") {
        return "Vendas apenas para pessoas fisicas";
    }
    if (country.length !== 2) {
        return "Country necessita ter 2 (dois) caracteres.";
    }
    if (name.split(" ").length < 2) {
        return "O nome precisa ter nome e sobrenome.";
    }
    if (documents.length !== 11) {
        return "O CPF precisa ter 11 (onze) caracteres.";
    }
}

module.exports = { validandoDados };