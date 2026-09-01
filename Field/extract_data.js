// [2026-09-01] 2차 수정: 업체별 상세 시설정보(주소/환경기술인/전화번호/사업자번호,
// 배출구별 시설분류/방지시설/용량/높이/종별/방지효율/굴뚝치수)까지 추출하도록 확장.
// 기존에는 업체명+배출구번호+측정항목만 추출했었는데, 이 정보만으로는 웹사이트에
// 자동생성되는 각종 서식(결과보고서/대기측정기록부/1m이내기록지)에 실제 업체 정보를
// 채울 수 없어 특정 업체(대한자동차1급공업사)의 예시 값이 모든 업체 서식에 그대로
// 하드코딩되어 나가는 문제가 있었음 → 배출구별 상세정보를 ventDetails로 추가.
//
// 이 스크립트는 로컬 PC의 내부 엑셀(성적서 원본)에서 업체/배출구/측정항목 및 상세
// 시설정보를 public/Field/db.json, db.js로 추출하는 개발용 도구입니다. public/ 폴더는
// 그대로 웹에 배포되므로, 실행은 반드시 로컬에서만 하고 이 스크립트 자체는 배포 폴더
// 밖(예: tools/)으로 옮기는 것을 권장합니다.
//
// 실행 전 파일 경로(filePath)를 실제 원본 엑셀 위치로 맞춰주세요.
// 실행: node extract_data.js  (같은 폴더에 db.json 생성 → 그 내용을
//       "const DB = " + JSON.stringify(...) + ";" 형태로 db.js에도 반영해야 함)

const XLSX = require('xlsx');
const fs = require('fs');

const filePath = 'K:\\업무\\충남환경\\성적서 26070601~04B\\26070601B 대한자동차1급공업사 04 (350).xlsx';
const JUNK_ITEMS = new Set(['1', '확인필요', '']);

const workbook = XLSX.readFile(filePath);

const sheet = workbook.Sheets['업체시설관리'];
const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

const companies = {};
const allItemsSet = new Set();

// Start from row 2 (index 2) to skip headers
for (let i = 2; i < data.length; i++) {
    const row = data[i];
    if (!row || !row[4]) continue; // E column is 업체명

    const companyName = row[4];
    const address = row[5];        // F 업체주소
    const techPerson = row[6];     // G 환경기술인
    const phone = row[8];          // I 업체전화번호
    const bizRegNo = row[9];       // J 사업자번호
    const dept = row[2];           // C 담당

    const ventNum = row[10];       // K 시설번호(배출구)
    const facilityType = row[11];        // L 배출시설분류
    const preventionFacility = row[12];  // M 방지시설
    const cycle = row[13];               // N 측정주기
    const capacity = row[15];            // P 풍량
    const companyGrade = row[16];        // Q 업체종수
    const facilityGrade = row[17];       // R 시설종수
    const height = row[18];              // S 높이
    const efficiency = row[19];          // T 방지시설 효율
    const itemsU = row[20];              // U 방지대상물질(기록부1)
    const itemsV = row[21];              // V 방지대상물질(기록부2)
    const circleDia = row[22];           // W 원형
    const rectWidth = row[23];           // X 사각 가로
    const rectHeight = row[24];          // Y 사각 세로

    if (!companies[companyName]) {
        companies[companyName] = {
            address: address || '',
            techPerson: techPerson || '',
            phone: phone || '',
            bizRegNo: bizRegNo || '',
            dept: dept || '',
            vents: [],
            items: [],
            ventDetails: []
        };
    }
    const info = companies[companyName];
    if (!info.address && address) info.address = address;
    if (!info.techPerson && techPerson) info.techPerson = techPerson;
    if (!info.phone && phone) info.phone = phone;
    if (!info.bizRegNo && bizRegNo) info.bizRegNo = bizRegNo;

    let ventDetail = null;
    if (ventNum !== undefined) {
        if (!info.vents.includes(ventNum)) {
            info.vents.push(ventNum);
            ventDetail = {
                ventNum, facilityType: facilityType || '', preventionFacility: preventionFacility || '',
                cycle: cycle || '', capacity: capacity ?? null, companyGrade: companyGrade ?? null,
                facilityGrade: facilityGrade ?? null, height: height ?? null, efficiency: efficiency ?? null,
                circleDia: circleDia ?? null, rectWidth: rectWidth ?? null, rectHeight: rectHeight ?? null,
                items: []
            };
            info.ventDetails.push(ventDetail);
        } else {
            ventDetail = info.ventDetails.find(v => v.ventNum === ventNum);
        }
    }

    [itemsU, itemsV].forEach(raw => {
        if (!raw) return;
        raw.split(',').forEach(item => {
            const cleanItem = item.trim();
            if (cleanItem && !JUNK_ITEMS.has(cleanItem)) {
                if (!info.items.includes(cleanItem)) info.items.push(cleanItem);
                if (ventDetail && !ventDetail.items.includes(cleanItem)) ventDetail.items.push(cleanItem);
                allItemsSet.add(cleanItem);
            }
        });
    });
}

const result = {
    companies: companies,
    allItems: Array.from(allItemsSet).sort()
};

fs.writeFileSync('db.json', JSON.stringify(result, null, 2));
fs.writeFileSync('db.js', 'const DB = ' + JSON.stringify(result) + ';\n');

console.log("Extraction complete. companies:", Object.keys(companies).length, "items:", result.allItems.length);
