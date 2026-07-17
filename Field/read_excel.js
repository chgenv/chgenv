const XLSX = require('xlsx');
const fs = require('fs');

const filePath = 'K:\\업무\\충남환경\\성적서 26070601~04B\\26070601B 대한자동차1급공업사 04 (350).xlsx';

try {
    if (!fs.existsSync(filePath)) {
        console.error("File does not exist: ", filePath);
        process.exit(1);
    }
    const workbook = XLSX.readFile(filePath, { cellFormula: true });
    
    let output = "";
    
    for (const sheetName of workbook.SheetNames) {
        output += `\n--- Sheet: ${sheetName} ---\n`;
        const sheet = workbook.Sheets[sheetName];
        
        const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null });
        for (let rowIndex = 0; rowIndex < data.length; rowIndex++) {
            const row = data[rowIndex];
            if (row.some(cell => cell !== null && cell !== "")) {
                let rowStr = `Row ${rowIndex + 1}: `;
                let hasData = false;
                for (let colIndex = 0; colIndex < row.length; colIndex++) {
                    const cellAddress = XLSX.utils.encode_cell({ c: colIndex, r: rowIndex });
                    const cell = sheet[cellAddress];
                    if (cell && cell.v !== undefined && cell.v !== null && cell.v !== "") {
                        hasData = true;
                        let cellInfo = `${cellAddress}=${cell.v}`;
                        if (cell.f) {
                            cellInfo += ` (Formula: ${cell.f})`;
                        }
                        rowStr += `[${cellInfo}] `;
                    }
                }
                if (hasData) {
                    output += rowStr + "\n";
                }
            }
        }
    }
    
    fs.writeFileSync('excel_dump.txt', output);
    console.log("Dumped to excel_dump.txt");
} catch (error) {
    console.error("Error reading file:", error.message);
}
