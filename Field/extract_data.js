// [2026-09-01] 보안 조치로 경로 참고용 주석 정리 + 데이터 정확도 버그 수정.
// 이 스크립트는 로컬 PC의 내부 엑셀(성적서 원본)에서 업체/배출구/측정항목 목록을
// public/Field/db.json으로 추출하는 개발용 도구입니다. public/ 폴더는 그대로 웹에
// 배포되므로, 실행은 반드시 로컬에서만 하고 이 스크립트 자체는 배포 폴더 밖(예: tools/)
// 으로 옮기는 것을 권장합니다.
//
// 수정 내용 (실제 성적서 엑셀과 대조하여 발견):
// 1. 기존䗐는 U열(방지대상물질 기록부1)만 읽어서, V열(방지대상물질 기록부2)에만
//    기록된 항목("염소", "수은화합물" 등, 예: (주)이에프씨/청주시 환경관리본부)이
//    누락되어 있었음 → V열도 함께 읽도록 수정.
// 2. 원본 데이터에 잘못 입력된 값("1", "확인필요")이 그대로 측정항목 선택지에 노출되고
//    있었음 → 필터링 추가.
//
// 실행 전 파일 경로(filePath)를 실제 원본 엑셀 위치로 맞춰주세요.

const XLSX = require('xlsx');
const fs = require('fs');

const filePath = 'K:\\업무\\충남환경\\성적서 26070601~04B\\26070601B 대한자동차1급공업사 04 (350).xlsx';
const JUNK_ITEMS = new Set(['1', '확인필요', '']);

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
    const itemsU = row[20]; // U column is 방지대상물질(기록부1)
    const itemsV = row[21]; // V column is 방지대상물질(기록부2)

    if (!companies[companyName]) {
        companies[companyName] = { vents: [], items: [] };
    }
    if (ventNum !== undefined && !companies[companyName].vents.includes(ventNum)) {
        companies[companyName].vents.push(ventNum);
    }
    [itemsU, itemsV].forEach(raw => {
        if (!raw) return;
        raw.split(',').forEach(item => {
            const cleanItem = item.trim();
            if (cleanItem && !JUNK_ITEMS.has(cleanItem) && !companies[companyName].items.includes(cleanItem)) {
                companies[companyName].items.push(cleanItem);
            }
        });
    });
}

// Extract pollutants from other sheets or just create a known list
const allItems = new Set();
for (const comp in companies) {
    companies[comp].items.forEach(i => allItems.add(i));
}

// Write to JSON
fs.writeFileSync('db.json', JSON.stringify({
    companies: companies,
    allItems: Array.from(allItems).sort()
}, null, 2));

console.log("Extraction complete.");
