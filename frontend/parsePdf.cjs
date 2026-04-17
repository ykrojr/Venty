const fs = require('fs');
const PDFParser = require("pdf2json");

async function parseAll() {
    const dir = 'C:/Users/pepec/Downloads';
    const files = fs.readdirSync(dir);
    
    for (const f of files) {
        if ((f.toLowerCase().includes('catalogo') || f.toLowerCase().includes('cata')) && f.toLowerCase().endsWith('.pdf')) {
            console.log('\n========================================');
            console.log('--- ARQUIVO ENCONTRADO:', f, '---');
            console.log('========================================\n');
            
            let pdfParser = new PDFParser(this, 1);
            
            pdfParser.on("pdfParser_dataError", errData => console.error(errData.parserError) );
            pdfParser.on("pdfParser_dataReady", pdfData => {
                console.log(pdfParser.getRawTextContent().substring(0, 1500)); // Lendo as primeiras 1500 letras
                // console.log("... texto cortado ...");
            });
            
            pdfParser.loadPDF(`${dir}/${f}`);
        }
    }
}
parseAll();
