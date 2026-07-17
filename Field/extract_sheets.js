const XLSX = require('xlsx');
const fs = require('fs');
const wb = XLSX.readFile('K:\\업무\\충남환경\\성적서 26070601~04B\\26070601B 대한자동차1급공업사 04 (350).xlsx');
const targetSheets = wb.SheetNames.filter(n => n.includes('기록부') || n.includes('기록지') || n.includes('채취'));
let out = '';
targetSheets.forEach(sn => {
    out += '\n\n=== SHEET: ' + sn + ' ===\n';
    const sheet = wb.Sheets[sn];
    const json = XLSX.utils.sheet_to_json(sheet, {header: 1});
    json.forEach((row, rIdx) => {
        if(row.length > 0) {
            let rowStr = 'Row ' + (rIdx+1) + ': ';
            let hasData = false;
            row.forEach((cell, cIdx) => {
                if(cell !== undefined && cell !== null && cell !== '') {
                    rowStr += `[Col ${cIdx}=${cell}] `;
                    hasData = true;
                }
            });
            if (hasData) {
                out += rowStr + '\n';
            }
        }
    });
});
fs.writeFileSync('sheet_layouts.txt', out);
console.log('Found sheets:', targetSheets.join(', '));
