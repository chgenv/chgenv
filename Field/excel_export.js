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
// [2026-09-01 2차 수정] 결과보고서/기록부/기록지를 각각 따로 다운로드하던 것을,
// 사용자 요청에 따라 template_combined.xlsx(시트 3개: 결과보고서/기록부/기록지)
// 하나로 합쳐서 버튼 1개로 한 번에 받도록 변경.
//
// 주의: 여기서 채우지 못한(원본 데이터에 없는) 세부 항목(예: 시설가동상황의 연료
// 사용량, 개별 채취점 여러 줄 등)은 빈 칸으로 남겨두므로, 다운로드한 뒤 필요하면
// 엑셀에서 직접 보완해야 한다. 특정 업체의 예시 값이 다른 업체 문서에 잘못
// 들어가는 것을 막기 위해, 서식 파일(template_*.xlsx) 자체에서 이런 항목은 이미
// 비워둔 상태다.

const ExcelExport = (() => {
    const TEMPLATE_PATHS = {
        combined: 'templates/template_combined.xlsx',
        statement: 'templates/template_statement.xlsx',
    };
    const SHEET_NAMES = {
        statement: '거래명세표',
    };

    async function loadWorkbook(key) {
        if (typeof ExcelJS === 'undefined') {
            throw new Error('엑셀 생성 라이브러리(ExcelJS)를 불러오지 못했습니다. 인터넷 연결을 확인해주세요.');
        }
        const res = await fetch(TEMPLATE_PATHS[key]);
        if (!res.ok) throw new Error('서식 파일을 불러오지 못했습니다: ' + TEMPLATE_PATHS[key]);
        const buf = await res.arrayBuffer();
        const wb = new ExcelJS.Workbook();
        await wb.xlsx.load(buf);
        return wb;
    }

    async function loadTemplate(key) {
        const wb = await loadWorkbook(key);
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

    // ---- 1~3. 결과보고서 + 기록부 + 기록지 (한 파일, 시트 3개) ----
    async function downloadCombined(ctx) {
        const wb = await loadWorkbook('combined');
        const wsReport = wb.getWorksheet('결과보고서');   // 반기별 자가측정 결과보고서 (별지 제21호서식)
        const wsGimokbu = wb.getWorksheet('기록부');       // 대기측정기록부 / 1m이내기록부
        const wsGimokji = wb.getWorksheet('기록지');       // 먼지시료채취 기록지 / 1m이내기록지 ('먼지' 측정시에만 의미있음)

        const {
            companyInfo, ventDetail, workplaceName, ventNum, dateString, sampler,
            item, unit, C, temp, humidity, press, windDir, v, Xw, oxygen, standardOxygen, Q, I, time, vm
        } = ctx;

        // 1) 결과보고서
        wsReport.getCell('E3').value = workplaceName;
        wsReport.getCell('E5').value = '대표이사';
        wsReport.getCell('N5').value = (companyInfo && companyInfo.techPerson) || '';
        wsReport.getCell('E7').value = (companyInfo && companyInfo.address) || '';
        wsReport.getCell('N7').value = (companyInfo && companyInfo.phone) || '';
        wsReport.getCell('E8').value = gradeCheckbox(ventDetail && ventDetail.companyGrade);
        wsReport.getCell('N8').value = halfYearLabel(new Date());
        wsReport.getCell('F15').value = ventDetail ? `${ventNum}번 (${ventDetail.facilityType || ''})` : `${ventNum}번`;
        wsReport.getCell('G15').value = (ventDetail && ventDetail.facilityGrade) ? `${ventDetail.facilityGrade}종` : '';
        wsReport.getCell('H15').value = dateString;
        wsReport.getCell('J15').value = item;
        wsReport.getCell('L15').value = `${fmtNum(C)} ${unit}`;
        wsReport.getCell('M15').value = (ventDetail && ventDetail.capacity != null) ? ventDetail.capacity : '';
        wsReport.getCell('O15').value = '대기오염공정시험기준';
        wsReport.getCell('A28').value = dateString;
        wsReport.getCell('A29').value = workplaceName;

        // 2) 대기측정기록부 (1m이내기록부)
        wsGimokbu.getCell('E4').value = workplaceName;
        wsGimokbu.getCell('E5').value = (companyInfo && companyInfo.address) || '';
        wsGimokbu.getCell('E6').value = '대표이사';
        wsGimokbu.getCell('E7').value = (companyInfo && companyInfo.techPerson) || '';
        wsGimokbu.getCell('K4').value = (ventDetail && ventDetail.facilityType) || '';
        wsGimokbu.getCell('K5').value = (ventDetail && ventDetail.companyGrade != null) ? ventDetail.companyGrade : '';
        wsGimokbu.getCell('K6').value = '-';
        wsGimokbu.getCell('K7').value = ventNum;
        wsGimokbu.getCell('D11').value = (ventDetail && ventDetail.preventionFacility) || '';
        wsGimokbu.getCell('G11').value = (ventDetail && ventDetail.capacity != null) ? `${ventDetail.capacity} m³/분` : '';
        wsGimokbu.getCell('I11').value = (ventDetail && ventDetail.height != null) ? `${ventDetail.height} m` : '';
        wsGimokbu.getCell('J12').value = (ventDetail && ventDetail.circleDia) ? ventDetail.circleDia : '-';
        wsGimokbu.getCell('K12').value = (ventDetail && ventDetail.rectWidth) || '-';
        wsGimokbu.getCell('L12').value = (ventDetail && ventDetail.rectHeight) || '-';
        wsGimokbu.getCell('M11').value = (ventDetail && ventDetail.facilityGrade) ? `${ventDetail.facilityGrade}종` : '';
        wsGimokbu.getCell('N11').value = (ventDetail && ventDetail.efficiency != null) ? `${ventDetail.efficiency}%` : '';
        wsGimokbu.getCell('D13').value = ((ventDetail && ventDetail.items) || []).join(',');
        wsGimokbu.getCell('E16').value = temp;
        wsGimokbu.getCell('G16').value = humidity;
        wsGimokbu.getCell('I16').value = press;
        wsGimokbu.getCell('K16').value = windDir;
        wsGimokbu.getCell('C19').value = fmtNum(Q, 1);
        wsGimokbu.getCell('D19').value = fmtNum(Q / 60, 2);
        wsGimokbu.getCell('E19').value = '-';
        wsGimokbu.getCell('F19').value = '-';
        wsGimokbu.getCell('G19').value = fmtNum(v, 2);
        wsGimokbu.getCell('I19').value = (standardOxygen !== undefined && standardOxygen !== null && !isNaN(standardOxygen)) ? standardOxygen : '-';
        wsGimokbu.getCell('J19').value = oxygen;
        wsGimokbu.getCell('K19').value = fmtNum(Xw, 2);
        wsGimokbu.getCell('L19').value = temp;
        wsGimokbu.getCell('E20').value = '정상가동 이상무';
        wsGimokbu.getCell('K20').value = '정상가동 이상무';
        wsGimokbu.getCell('E21').value = dateString;
        wsGimokbu.getCell('K21').value = sampler || '';
        wsGimokbu.getCell('C26').value = (ventDetail && ventDetail.facilityType) || '';
        wsGimokbu.getCell('M26').value = (ventDetail && ventDetail.preventionFacility) || '';
        wsGimokbu.getCell('B36').value = 1;
        wsGimokbu.getCell('C36').value = item;
        wsGimokbu.getCell('F36').value = unit;
        wsGimokbu.getCell('G36').value = fmtNum(C);
        wsGimokbu.getCell('K36').value = '-';
        wsGimokbu.getCell('B65').value = dateString;

        // 3) 먼지시료채취 기록지 (1m이내기록지) — '먼지' 측정이 아니면 대부분 빈 시트로 남음
        wsGimokji.getCell('I5').value = workplaceName;
        wsGimokji.getCell('I6').value = (ventDetail && ventDetail.facilityType) || '';
        wsGimokji.getCell('I7').value = dateString;
        wsGimokji.getCell('I10').value = oxygen;
        wsGimokji.getCell('I12').value = fmtNum(I, 2);
        wsGimokji.getCell('L14').value = (ventDetail && ventDetail.rectWidth) || '';
        wsGimokji.getCell('L15').value = (ventDetail && ventDetail.rectHeight) || '';
        wsGimokji.getCell('AB6').value = temp;
        wsGimokji.getCell('AB7').value = press;
        wsGimokji.getCell('AB10').value = fmtNum(Xw, 2);
        wsGimokji.getCell('U15').value = humidity;
        wsGimokji.getCell('Y15').value = windDir;
        wsGimokji.getCell('D21').value = time;
        wsGimokji.getCell('J21').value = temp;
        wsGimokji.getCell('S21').value = (vm !== undefined && vm !== null) ? (vm / 1000).toFixed(4) : '';
        wsGimokji.getCell('D31').value = time;
        wsGimokji.getCell('J32').value = temp;
        wsGimokji.getCell('W52').value = dateString;

        const buf = await wb.xlsx.writeBuffer();
        triggerDownload(buf, `${safeFileName(workplaceName)}_측정서류_${ventNum}번배출구.xlsx`);
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

    return { downloadCombined, downloadStatement, gradeCheckbox, halfYearLabel };
})();
