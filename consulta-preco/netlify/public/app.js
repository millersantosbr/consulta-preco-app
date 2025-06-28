// public/app.js
document.addEventListener('DOMContentLoaded', () => {
    // Telas
    const homeScreen = document.getElementById('home-screen');
    const scannerScreen = document.getElementById('scanner-screen');
    const resultScreen = document.getElementById('result-screen');

    // Botões
    const btnScan = document.getElementById('btn-scan');
    const btnSearch = document.getElementById('btn-search');
    const btnStopScan = document.getElementById('btn-stop-scan');
    const btnScanAgain = document.getElementById('btn-scan-again');
    const btnSearchAgain = document.getElementById('btn-search-again');

    const resultContent = document.getElementById('result-content');
    const qrReaderDiv = document.getElementById('qr-reader');

    let html5QrCode;

    function showScreen(screen) {
        homeScreen.classList.add('hidden');
        scannerScreen.classList.add('hidden');
        resultScreen.classList.add('hidden');
        screen.classList.remove('hidden');
    }

    async function fetchProduct(code) {
        showScreen(resultScreen);
        resultContent.innerHTML = `<p class="loading-text">Buscando...</p>`;
        
        try {
            // A URL deve corresponder ao seu endereço de backend
            const response = await fetch(`/api/product/${code}`);
            
            if (!response.ok) {
                 throw new Error('Produto não encontrado');
            }
            
            const product = await response.json();
            displayProduct(product);

        } catch (error) {
            displayError(error.message);
        }
    }
    
    function displayProduct(product) {
        resultContent.innerHTML = `
            <h2>${product.name}</h2>
            <p class="price">R$ ${product.price}</p>
            <p>Código: #${product.id}</p>
            <p>EAN: ${product.barcode}</p>
            <img src="${product.image}" alt="${product.name}">
        `;
    }

    function displayError(message) {
        resultContent.innerHTML = `
            <h2>Erro na busca</h2>
            <p>${message}</p>
            <img src="https://api.iconify.design/bx:error-circle.svg?color=%23dc3545" style="width: 80px; height: 80px;">
        `;
    }

    function onScanSuccess(decodedText, decodedResult) {
        console.log(`Code matched = ${decodedText}`, decodedResult);
        stopScanner();
        fetchProduct(decodedText);
    }
    
    function startScanner() {
        showScreen(scannerScreen);
        html5QrCode = new Html5Qrcode("qr-reader");
        html5QrCode.start(
            { facingMode: "environment" }, // Usa a câmera traseira
            {
                fps: 10,
                qrbox: { width: 250, height: 150 } // Tamanho da caixa de scan
            },
            onScanSuccess
        ).catch(err => {
            console.error("Não foi possível iniciar o scanner", err);
            displayError("Não foi possível acessar a câmera.");
            showScreen(resultScreen);
        });
    }

    function stopScanner() {
        if (html5QrCode && html5QrCode.isScanning) {
            html5QrCode.stop().then(() => {
                console.log("Scanner parado.");
            }).catch(err => {
                console.error("Falha ao parar o scanner", err);
            });
        }
        showScreen(homeScreen);
    }

    // --- Event Listeners ---
    btnScan.addEventListener('click', startScanner);
    btnScanAgain.addEventListener('click', startScanner);
    btnStopScan.addEventListener('click', () => {
        stopScanner();
        showScreen(homeScreen);
    });
    
    btnSearch.addEventListener('click', () => {
        const code = prompt("Digite o código do produto ou código de barras:");
        if (code) {
            fetchProduct(code.trim());
        }
    });

    btnSearchAgain.addEventListener('click', () => {
        const code = prompt("Digite o código do produto ou código de barras:");
        if (code) {
            fetchProduct(code.trim());
        }
    });
});