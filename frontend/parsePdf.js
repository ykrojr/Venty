import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';

async function parseAll() {
    const dir = 'C:/Users/pepec/Downloads';
    const files = fs.readdirSync(dir);
    
    for (const f of files) {
        if (f.toLowerCase().includes('catalogo') || f.toLowerCase().includes('cata') && f.toLowerCase().endsWith('.pdf')) {
            console.log('\n--- ARQUIVO ENCONTRADO:', f, '---');
            const dataBuffer = fs.readFileSync(path.join(dir, f));
            try {
                const data = await pdfParse(dataBuffer);
                console.log(data.text);
            } catch(e) {
                console.error("Erro lendo", f);
            }
        }
    }
}
parseAll();
