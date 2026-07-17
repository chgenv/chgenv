const XLSX = require('xlsx');
const fs = require('fs');

const filePath = 'K:\\업무\\충남환경\\성적서 26070601~04B\\26070601B 대한자동차1급공업사 04 (350).xlsx';
const workbook = XLSX.readFile(filePath);

const sheet = workbook.Sheets['업체시설관리'];
const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

const companies = {};

// Start from row 2 (index 2) to skip headers
for (let i = 2; i < data.length; i++) {
    const row = data[i];
    if (!row || !row[4]) continue; // E column is 업체명
    
    const companyName = row[4];
    const ventNum = row[10]; // K column is 시설번호(배출구)
    const items = row[20]; // U column is 방지대상물질(기록부1)

    if (!companies[companyName]) {
        companies[companyName] = { vents: [], items: [] };
    }
    if (ventNum !== undefined && !companies[companyName].vents.includes(ventNum)) {
        companies[companyName].vents.push(ventNum);
    }
    if (items) {
        items.split(',').forEach(item => {
            const cleanItem = item.trim();
            if (cleanItem && !companies[companyName].items.includes(cleanItem)) {
                companies[companyName].items.push(cleanItem);
            }
        });
    }
}

// Extract pollutants from other sheets or just create a known list
const allItems = new Set();
for (const comp in companies) {
    companies[comp].items.forEach(i => allItems.add(i));
}

// Write to JSON
fs.writeFileSync('db.json', JSON.stringify({
    companies: companies,
    allItems: Array.from(allItems)
}, null, 2));

console.log("Extraction complete.");
