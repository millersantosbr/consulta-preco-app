// netlify/functions/product.js

const fs = require('fs');
const path = require('path');

// O caminho para o banco de dados agora é relativo à raiz do projeto
// __dirname se refere ao diretório da função, então subimos dois níveis
const dbPath = path.resolve(__dirname, '../../database.json'); 
const productsDB = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

exports.handler = async (event, context) => {
    // No Express era req.params.code. Em funções Netlify, extraímos da URL.
    // O caminho será algo como "/api/product/7891000325858"
    const pathParts = event.path.split('/');
    const code = pathParts.pop() || pathParts.pop(); // Pega o último segmento da URL

    console.log(`Buscando produto com o código: ${code}`);

    const product = productsDB.find(p => p.barcode === code || p.id === code);

    if (product) {
        return {
            statusCode: 200,
            body: JSON.stringify(product) // A resposta precisa ser uma string
        };
    } else {
        return {
            statusCode: 404,
            body: JSON.stringify({ error: 'Produto não encontrado' })
        };
    }
};