// excel_export.js
// [2026-09-01] 신규 추가: 실제로 제출/보관하는 원본 엑셀 서식(반기별 자가측정
// 결과보고서, 대기측정기록부(1m이내기록부), 먼지시료채취 기록지(1m이내기록지),
// 거래명세표)을 그대로 불러와서 업체/배출구/측정값만 채워 넣은 뒤 다운로드한다.
//
// 화면에 보이는 "문서 미리보기" 탭(templates.js)은 빠르게 눈으로 확인하기 위한
// 참고용 근사치이고, 실제 제출·보관용 문서는 이 파일이 만들어내는 .xlsx가 원본이다.
// 서식(괘선/병합/폰트 등)은 원본 엑셀 파일(templates/*.xlsx)을 그대로 사용하므로
// 레이아웃이 실제 사용 양식과 100% 동일하다. 이 파일은 그 안의 "값"만 채워 넣는다.
//
// 주의: 여기서 채우지 못한(원본 데이터에 없는) 세부 항목(예: 시설가동상황의 연료
// 사용량, 개별 채취점 여러 줄 등)은 빈 칸으로 남겨두므로, 다운로드한 뒤 필요하면
// 엑셀에서 직접 보완해야 한다. 특정 업체의 예시 값이 다른 업체 문서에 잘못
// 들어가는 것을 막기 위해, 서식 파일(template_*.xlsx) 자체에서 이런 항목은 이미
// 비워둔 상태다.

const ExcelExport = (() => {
    const TEMPLATE_PATHS = {
        report: 'templates/template_report.xlsx',
        gimokbu: 'templates/template_gimokbu.xlsx',
        gimokji: 'templates/template_gimokji.xlsx',
        statement: 'templates/template_statement.xlsx',
    };
    const SHEET_NAMES = {
        report: '반기별',
        gimokbu: '1m이내기록부',
        gimokji: '1m이내기록지',
        statement: '거래명세표',
    };

    async function loadTemplate(key) {
        if (typeof ExcelJS === 'undefined') {
            throw new Error('엑셀 생성 라이브러리(ExcelJS)를 불러오지 못했습니다. 인터넷 연결을 확인해주세요.');
        }
        const res = await fetch(TEMPLATE_PATHS[key]);
        if (!res.ok) throw new Error('서식 파일을 불러오지 못했습니다: ' + TEMPLATE_PATHS[key]);
        const buf = await res.arrayBuffer();
        const wb = new ExcelJS.Workbook();
        await wb.xlsx.load(buf);
        const ws = wb.getWorksheet(SHEET_NAMES[key]);
        return { wb, ws };
    }

    function triggerDownload(buffer, filename) {
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 5000);
    }

    function safeFileName(s) {
        return String(s || '').replace(/[\\/:*?"<>|]/g, '_');
    }

    function gradeCheckbox(grade) {
        const g = Number(grade);
        return [1, 2, 3, 4, 5].map(n => `[${g === n ? 'V' : ' '}]${n}종`).join(' ');
    }

    function halfYearLabel(d) {
        const y = d.getFullYear();
        return `${y}년 ${(d.getMonth() + 1) <= 6 ? '상반기' : '하반기'}`;
    }

    function fmtNum(v, digits) {
        if (v === undefined || v === null || v === '' || isNaN(v)) return '-';
        return Number(v).toFixed(digits === undefined ? 2 : digits);
    }

    // ---- 1. 반기별 자가측정 결과보고서 (별지 제21호서식) ----
    async function downloadReport(ctx) {
        const { wb, ws } = await loadTemplate('report');
        const { companyInfo, ventDetail, workplaceName, ventNum, dateString, item, unit, C } = ctx;

        ws.getCell('E3').value = workplaceName;
        ws.getCell('E5').value = '대표이사';
        ws.getCell('N5').value = (companyInfo && companyInfo.techPerson) || '';
        ws.getCell('E7').value = (companyInfo && companyInfo.address) || '';
        ws.getCell('N7').value = (companyInfo && companyInfo.phone) || '';
        ws.getCell('E8').value = gradeCheckbox(ventDetail && ventDetail.companyGrade);
        ws.getCell('N8').value = halfYearLabel(new Date());

        ws.getCell('F15').value = ventDetail ? `${ventNum}번 (${ventDetail.facilityType || ''})` : `${ventNum}번`;
        ws.getCell('G15').value = (ventDetail && ventDetail.facilityGrade) ? `${ventDetail.facilityGrade}종` : '';
        ws.getCell('H15').value = dateString;
        ws.getCell('J15').value = item;
        ws.getCell('L15').value = `${fmtNum(C)} ${unit}`;
        ws.getCell('M15').value = (ventDetail && ventDetail.capacity != null) ? ventDetail.capacity : '';
        ws.getCell('O15').value = '대기오염공정시험기준';

        ws.getCell('A28').value = dateString;
        ws.getCell('A29').value = workplaceName;

        const buf = await wb.xlsx.writeBuffer();
        triggerDownload(buf, `${safeFileName(workplaceName)}_반기별자가측정결과보고서_${ventNum}번배출구.xlsx`);
    }

    // ---- 2. 대기측정기록부 / 1m이내기록부 (별지 제21호서식 개정2024.11.01) ----
    async function downloadGimokbu(ctx) {
        const { wb, ws } = await loadTemplate('gimokbu');
        const {
            companyInfo, ventDetail, workplaceName, ventNum, dateString, sampler,
            item, unit, C, temp, humidity, press, windDir, v, Xw, oxygen, standardOxygen, Q
        } = ctx;

        ws.getCell('E4').value = workplaceName;
        ws.getCell('E5').value = (companyInfo && companyInfo.address) || '';
        ws.getCell('E6').value = '대표이사';
        ws.getCell('E7').value = (companyInfo && companyInfo.techPerson) || '';
        ws.getCell('K4').value = (ventDetail && ventDetail.facilityType) || '';
        ws.getCell('K5').value = (ventDetail && ventDetail.companyGrade != null) ? ventDetail.companyGrade : '';
        ws.getCell('K6').value = '-';
        ws.getCell('K7').value = ventNum;

        ws.getCell('D11').value = (ventDetail && ventDetail.preventionFacility) || '';
        ws.getCell('G11').value = (ventDetail && ventDetail.capacity != null) ? `${ventDetail.capacity} m³/분` : '';
        ws.getCell('I11').value = (ventDetail && ventDetail.height != null) ? `${ventDetail.height} m` : '';
        ws.getCell('J12').value = (ventDetail && ventDetail.circleDia) ? ventDetail.circleDia : '-';
        ws.getCell('K12').value = (ventDetail && ventDetail.rectWidth) || '-';
        ws.getCell('L12').value = (ventDetail && ventDetail.rectHeight) || '-';
        ws.getCell('M11').value = (ventDetail && ventDetail.facilityGrade) ? `${ventDetail.facilityGrade}종` : '';
        ws.getCell('N11').value = (ventDetail && ventDetail.efficiency != null) ? `${ventDetail.efficiency}%` : '';
        ws.getCell('D13').value = ((ventDetail && ventDetail.items) || []).join(',');

        ws.getCell('E16').value = temp;
        ws.getCell('G16').value = humidity;
        ws.getCell('I16').value = press;
        ws.getCell('K16').value = windDir;

        ws.getCell('C19').value = fmtNum(Q, 1);
        ws.getCell('D19').value = fmtNum(Q / 60, 2);
        ws.getCell('E19').value = '-';
        ws.getCell('F19').value = '-';
        ws.getCell('G19').value = fmtNum(v, 2);
        ws.getCell('I19').value = (standardOxygen !== undefined && standardOxygen !== null && !isNaN(standardOxygen)) ? standardOxygen : '-';
        ws.getCell('J19').value = oxygen;
        ws.getCell('K19').value = fmtNum(Xw, 2);
        ws.getCell('L19').value = temp;

        ws.getCell('E20').value = '정상가동 이상무';
        ws.getCell('K20').value = '정상가동 이상무';
        ws.getCell('E21').value = dateString;
        ws.getCell('K21').value = sampler || '';

        ws.getCell('C26').value = (ventDetail && ventDetail.facilityType) || '';
        ws.getCell('M26').value = (ventDetail && ventDetail.preventionFacility) || '';

        ws.getCell('B36').value = 1;
        ws.getCell('C36').value = item;
        ws.getCell('F36').value = unit;
        ws.getCell('G36').value = fmtNum(C);
        ws.getCell('K36').value = '-';

        ws.getCell('B65').value = dateString;

        const buf = await wb.xlsx.writeBuffer();
        triggerDownload(buf, `${safeFileName(workplaceName)}_대기측정기록부_${ventNum}번배출구.xlsx`);
    }

    // ---- 3. 먼지시료채취 기록지 / 1m이내기록지 (측정항목이 '먼지'일 때만 사용) ----
    async function downloadGimokji(ctx) {
        const { wb, ws } = await loadTemplate('gimokji');
        const {
            companyInfo, ventDetail, workplaceName, dateString,
            temp, press, humidity, windDir, oxygen, Xw, I, time, vm
        } = ctx;

        ws.getCell('I5').value = workplaceName;
        ws.getCell('I6').value = (ventDetail && ventDetail.facilityType) || '';
        ws.getCell('I7').value = dateString;
        ws.getCell('I10').value = oxygen;
        ws.getCell('I12').value = fmtNum(I, 2);
        ws.getCell('L14').value = (ventDetail && ventDetail.rectWidth) || '';
        ws.getCell('L15').value = (ventDetail && ventDetail.rectHeight) || '';

        ws.getCell('AB6').value = temp;
        ws.getCell('AB7').value = press;
        ws.getCell('AB10').value = fmtNum(Xw, 2);

        ws.getCell('U15').value = humidity;
        ws.getCell('Y15').value = windDir;

        ws.getCell('D21').value = time;
        ws.getCell('J21').value = temp;
        ws.getCell('S21').value = (vm !== undefined && vm !== null) ? (vm / 1000).toFixed(4) : '';

        ws.getCell('D31').value = time;
        ws.getCell('J32').value = temp;

        ws.getCell('W52').value = dateString;

        const buf = await wb.xlsx.writeBuffer();
        triggerDownload(buf, `${safeFileName(workplaceName)}_먼지시료채취기록지.xlsx`);
    }

    // ---- 4. 거래명세표 ----
    // items: [{ name, qty, price }, ...] (최대 3줄, 템플릿 상 3줄까지 지원)
    async function downloadStatement(ctx) {
        const { wb, ws } = await loadTemplate('statement');
        const { companyInfo, workplaceName, items } = ctx;

        const now = new Date();
        ws.getCell('A2').value = now;
        ws.getCell('E3').value = workplaceName;
        ws.getCell('E5').value = (companyInfo && companyInfo.address) || '';
        ws.getCell('E7').value = (companyInfo && companyInfo.phone) || '';

        const rows = [12, 13, 14];
        let totalSupply = 0, totalTax = 0;
        (items || []).slice(0, 3).forEach((it, idx) => {
            const r = rows[idx];
            const qty = Number(it.qty) || 0;
            const price = Number(it.price) || 0;
            const supply = Math.round(qty * price);
            const tax = Math.round(supply * 0.1);
            ws.getCell('A' + r).value = now;
            ws.getCell('C' + r).value = it.name || '';
            ws.getCell('N' + r).value = qty;
            ws.getCell('P' + r).value = price;
            ws.getCell('U' + r).value = supply;
            ws.getCell('Z' + r).value = tax;
            totalSupply += supply;
            totalTax += tax;
        });

        ws.getCell('E9').value = totalSupply + totalTax;
        ws.getCell('U35').value = totalSupply;
        ws.getCell('Z35').value = totalTax;
        ws.getCell('C36').value = totalSupply;
        ws.getCell('J36').value = totalTax;
        ws.getCell('P36').value = totalSupply + totalTax;

        const buf = await wb.xlsx.writeBuffer();
        const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
        triggerDownload(buf, `${safeFileName(workplaceName)}_거래명세표_${dateStr}.xlsx`);
    }

    return { downloadReport, downloadGimokbu, downloadGimokji, downloadStatement, gradeCheckbox, halfYearLabel };
})();
