document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const workplaceSelect = document.getElementById('workplace');
    const ventSelect = document.getElementById('vent-num');
    const targetItemSelect = document.getElementById('target-item');
    const rawValueLabel = document.getElementById('raw-value-label');
    
    const cameraInput = document.getElementById('camera-input');
    const ocrLoading = document.getElementById('ocr-loading');
    const dataSection = document.getElementById('data-section');
    const resultSection = document.getElementById('result-section');
    
    // Inputs
    const tempInput = document.getElementById('temp');
    const pressureInput = document.getElementById('pressure');
    const oxygenInput = document.getElementById('oxygen');
    const standardOxygenInput = document.getElementById('standard-oxygen');
    const pipeLengthInput = document.getElementById('pipe-length');
    const volumeInput = document.getElementById('volume');
    const rawValueInput = document.getElementById('raw-value');
    
    const calcBtn = document.getElementById('calc-btn');
    const reportBtn = document.getElementById('report-btn');
    const manualInputBtn = document.getElementById('manual-input-btn');
    const cameraSection = document.getElementById('camera-section');
    
    const modal = document.getElementById('report-modal');
    const closeModalBtn = document.getElementById('close-modal');
    const closeModalBottomBtn = document.getElementById('close-modal-bottom');

    // 마지막으로 생성한 성적서 데이터 (엑셀 다운로드 버튼에서 재사용)
    let lastReportCtx = null;

    // 0. Authentication Logic
    const loginScreen = document.getElementById('login-screen');
    const mainApp = document.getElementById('main-app');
    const adminPanel = document.getElementById('admin-panel');
    const authBtn = document.getElementById('auth-btn');
    const authNameSelect = document.getElementById('auth-name');
    const authCodeInput = document.getElementById('auth-code');
    const authMsg = document.getElementById('auth-msg');

    // Admin configuration
    // 2026-09-01: 기본 비밀번호(1234)/관리자코드(9999)는 실사용 코드로 원복함.
    // 대신 (1) 관리자 전용 마스터키, (2) 직원별 개별 비밀번호 기능을 추가해서
    // 관리자 화면에서 직접 로테이션할 수 있게 함 — localStorage에 저장된 값은
    // 소스코드에는 없고 그 기기(브라우저)에만 남으므로, 실제로 값을 바꾸고 나면
    // 소스를 봐도 새 값은 보이지 않음. 단, 관리자가 한 번도 안 바꾼 기기는
    // 아래 기본값이 그대로 적용되니 배포 후 꼭 관리자 화면에서 값을 바꿔둘 것.
    const adminAccessCode = '9999'; // 관리자 로그인 코드
    // 기본(최초) 비밀번호 — 직원별 개별 비밀번호가 없는 경우 사용
    let currentUnifiedCode = localStorage.getItem('unifiedEmployeeCode') || '1234';
    // 마스터키 — 이름 선택과 무관하게 항상 로그인 허용 (관리자용 비상키)
    let currentMasterKey = localStorage.getItem('masterKey') || '116390';
    // 직원별 개별 비밀번호 { 이름: 코드 }
    let employeeCodes = {};
    try {
        employeeCodes = JSON.parse(localStorage.getItem('employeeCodes') || '{}');
    } catch (e) {
        employeeCodes = {};
    }

    authBtn.addEventListener('click', () => {
        const name = authNameSelect.value;
        const code = authCodeInput.value;

        if (!name) {
            authMsg.innerText = '이름을 선택해주세요.';
            authMsg.classList.remove('hidden');
            return;
        }
        if (!code) {
            authMsg.innerText = '보안코드를 입력해주세요.';
            authMsg.classList.remove('hidden');
            return;
        }

        if (name === '관리자') {
            if (code === adminAccessCode) {
                // Admin Login Success
                loginScreen.classList.add('hidden');
                adminPanel.classList.remove('hidden');
                authCodeInput.value = '';
                authMsg.classList.add('hidden');
            } else {
                // Admin Login Fail
                showAuthError('관리자 암호가 틀렸습니다.');
            }
        } else {
            // Employee Login: 마스터키 → 개별 비밀번호(있으면) → 기본 비밀번호 순으로 확인
            const employeeCode = employeeCodes[name];
            const isValid = (code === currentMasterKey) ||
                (employeeCode ? code === employeeCode : code === currentUnifiedCode);

            if (isValid) {
                // Employee Login Success
                loginScreen.style.transition = 'opacity 0.4s ease';
                loginScreen.style.opacity = '0';
                setTimeout(() => {
                    loginScreen.classList.add('hidden');
                    mainApp.classList.remove('hidden');
                }, 400);
            } else {
                // Employee Login Fail
                showAuthError('보안코드가 일치하지 않습니다.');
            }
        }
    });

    function showAuthError(msg) {
        authMsg.innerText = msg;
        authMsg.classList.remove('hidden');
        authCodeInput.classList.add('highlight-pulse');
        setTimeout(() => authCodeInput.classList.remove('highlight-pulse'), 800);
    }

    function showAdminMsg(msg) {
        const adminMsg = document.getElementById('admin-msg');
        adminMsg.innerText = msg;
        adminMsg.classList.remove('hidden');
        setTimeout(() => adminMsg.classList.add('hidden'), 3000);
    }

    // Admin Panel Logic
    // ① 기본(최초) 비밀번호 변경
    document.getElementById('change-code-btn').addEventListener('click', () => {
        const newCode = document.getElementById('new-auth-code').value;
        if (!newCode || newCode.length < 4) {
            alert('새로운 비밀번호를 4자리 이상 입력해주세요.');
            return;
        }

        localStorage.setItem('unifiedEmployeeCode', newCode);
        currentUnifiedCode = newCode;
        showAdminMsg('기본(최초) 비밀번호가 변경되었습니다!');
        document.getElementById('new-auth-code').value = '';
    });

    // ② 마스터키 변경
    document.getElementById('change-master-key-btn').addEventListener('click', () => {
        const newKey = document.getElementById('new-master-key').value;
        if (!newKey || newKey.length < 4) {
            alert('새로운 마스터키를 4자리 이상 입력해주세요.');
            return;
        }

        localStorage.setItem('masterKey', newKey);
        currentMasterKey = newKey;
        showAdminMsg('마스터키가 변경되었습니다!');
        document.getElementById('new-master-key').value = '';
    });

    // ③ 직원별 개별 비밀번호 변경 / 초기화
    function saveEmployeeCodes() {
        localStorage.setItem('employeeCodes', JSON.stringify(employeeCodes));
    }

    document.getElementById('change-employee-code-btn').addEventListener('click', () => {
        const name = document.getElementById('employee-code-name-select').value;
        const newCode = document.getElementById('new-employee-code').value;
        if (!name) {
            alert('비밀번호를 변경할 직원을 선택해주세요.');
            return;
        }
        if (!newCode || newCode.length < 4) {
            alert('새로운 비밀번호를 4자리 이상 입력해주세요.');
            return;
        }

        employeeCodes[name] = newCode;
        saveEmployeeCodes();
        showAdminMsg(`${name}님의 개별 비밀번호가 변경되었습니다!`);
        document.getElementById('new-employee-code').value = '';
    });

    document.getElementById('reset-employee-code-btn').addEventListener('click', () => {
        const name = document.getElementById('employee-code-name-select').value;
        if (!name) {
            alert('초기화할 직원을 선택해주세요.');
            return;
        }
        delete employeeCodes[name];
        saveEmployeeCodes();
        showAdminMsg(`${name}님은 이제 기본 비밀번호를 사용합니다.`);
    });

    document.getElementById('back-to-login-btn').addEventListener('click', () => {
        adminPanel.classList.add('hidden');
        loginScreen.style.opacity = '1';
        loginScreen.classList.remove('hidden');
        authNameSelect.selectedIndex = 0;
    });

    // Handle enter key in auth input
    authCodeInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            authBtn.click();
        }
    });

    // 0-1. Initialize Dropdowns from DB
    if (typeof DB !== 'undefined') {
        // Populate Workplaces
        Object.keys(DB.companies).sort().forEach(companyName => {
            const option = document.createElement('option');
            option.value = companyName;
            option.text = companyName;
            workplaceSelect.appendChild(option);
        });

        // Populate Target Items
        DB.allItems.sort().forEach(item => {
            const option = document.createElement('option');
            option.value = item;
            option.text = item;
            targetItemSelect.appendChild(option);
        });
    }

    // Handle Workplace Change -> Update Vent Numbers
    workplaceSelect.addEventListener('change', () => {
        ventSelect.innerHTML = '<option value="" disabled selected>배출구를 선택하세요</option>';
        ventSelect.disabled = false;
        const selectedCompany = workplaceSelect.value;
        if (DB && DB.companies[selectedCompany]) {
            DB.companies[selectedCompany].vents.forEach(vent => {
                const option = document.createElement('option');
                option.value = vent;
                option.text = `${vent}번 배출구`;
                ventSelect.appendChild(option);
            });
        }
    });

    // Handle Target Item Change -> Update Label (mg vs ppm)
    targetItemSelect.addEventListener('change', () => {
        if (targetItemSelect.value === '먼지') {
            rawValueLabel.innerHTML = '분석기 측정값 (mg)';
        } else {
            rawValueLabel.innerHTML = '분석기 측정값 (ppm)';
        }
    });

    // 1-1. Manual Input Logic
    manualInputBtn.addEventListener('click', () => {
        ocrLoading.classList.add('hidden');
        
        // Hide camera section with a quick fade-out effect for smooth UX
        cameraSection.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        cameraSection.style.opacity = '0';
        cameraSection.style.transform = 'translateY(-10px)';
        setTimeout(() => {
            cameraSection.style.display = 'none';
        }, 300);
        
        dataSection.classList.remove('hidden');
        
        // Ensure input fields are empty for manual entry
        tempInput.value = '';
        pressureInput.value = '';
        oxygenInput.value = '';
        pipeLengthInput.value = '';
        volumeInput.value = '';
        rawValueInput.value = '';
        
        // Scroll to data section after a slight delay
        setTimeout(() => {
            dataSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 350);
    });

    // 1. Photo Upload & AI (OCR) Simulation
    cameraInput.addEventListener('change', (e) => {
        if(e.target.files.length > 0) {
            // UI State Update: Show loading, hide others
            ocrLoading.classList.remove('hidden');
            dataSection.classList.add('hidden');
            resultSection.classList.add('hidden');
            
            ocrLoading.scrollIntoView({ behavior: 'smooth', block: 'center' });

            // Simulate AI processing delay
            setTimeout(() => {
                ocrLoading.classList.add('hidden');
                dataSection.classList.remove('hidden');
                
                // Inject Mock Data (Simulating OCR Extraction)
                tempInput.value = '26.0';
                pressureInput.value = '751.7';
                oxygenInput.value = '20.95';
                pipeLengthInput.value = '1.5';
                volumeInput.value = '0.4019';
                rawValueInput.value = '2.5';
                
                dataSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                
                // Add highlight micro-animation
                [tempInput, pressureInput, oxygenInput, pipeLengthInput, volumeInput, rawValueInput].forEach(input => {
                    input.classList.add('highlight-pulse');
                    setTimeout(() => input.classList.remove('highlight-pulse'), 1500);
                });
            }, 2500);
        }
    });

    // 2. Excel-based Calculation Logic
    calcBtn.addEventListener('click', () => {
        const temp = parseFloat(tempInput.value);
        const pressure = parseFloat(pressureInput.value);
        const oxygen = parseFloat(oxygenInput.value);
        const volume = parseFloat(volumeInput.value);
        const pipeLength = parseFloat(pipeLengthInput.value);
        const rawValue = parseFloat(rawValueInput.value);
        
        // Validation (including new rawValue)
        if (isNaN(temp) || isNaN(pressure) || isNaN(oxygen) || isNaN(volume) || isNaN(pipeLength) || isNaN(rawValue)) {
            alert('인식된 데이터 또는 분석기 측정값이 누락되었습니다. 빈칸을 모두 채워주세요.');
            return;
        }

        /**
         * 대기오염공정시험기준 기반 엑셀 계산식 실제 연동 (Mock Data 제거)
         */

        // 가. 표준상태 부피 (Vs) 계산
        // [2026-09-01 수정] 표준상태는 대기오염공정시험기준상 0℃(273.15K), 760mmHg 기준임.
        // 기존 코드는 293.15(20℃)를 분자로 사용해 Vs가 약 7.3% 과대산출되고 있었음
        // (먼지 항목은 C=원시값/Vs 이므로, 결과적으로 먼지 농도가 실제보다 낮게 계산되는 오류).
        // 아래 상세(정밀) 계산 로직(273 기준)과도 일치하도록 273.15로 통일함.
        const deadVolume = pipeLength * 0.0001;
        const adjustedVolume = volume - deadVolume;

        const vs = adjustedVolume * (273.15 / (273.15 + temp)) * (pressure / 760);
        
        // 나. 원시 농도 산출
        let rawConcentration = rawValue;
        
        // 먼지인 경우 mg 단위이므로 표준상태 부피(Vs)로 나누어 농도(mg/Sm3) 산출
        // 가스상 물질인 경우 ppm 단위이므로 부피로 나누지 않고 원시 농도 그대로 유지
        const selectedItem = targetItemSelect.value;
        if (selectedItem === '먼지') {
            rawConcentration = rawValue / vs; 
        }
        
        // 다. 보정 가스농도 (C) 계산 (산소 보정 적용)
        // [2026-09-01 수정] 표준산소농도는 시설 종류마다 법정 기준이 다름(예: 소각 12%,
        // 보일러 4~6% 등 대기환경보전법 시행규칙 별표 기준) — 기존에는 "10"으로
        // 고정되어 있어 시설 종류에 따라 잘못된 보정계수가 적용될 수 있었음.
        // 화면에서 해당 시설의 법정 표준산소농도를 직접 입력받도록 변경.
        // 입력하지 않으면(공란) 임의로 추정하지 않고 보정을 생략함(원시농도 그대로 사용).
        const standardOxygenRaw = parseFloat(standardOxygenInput.value);
        let c = rawConcentration;

        // 대기 산소 농도(약 20.9%)와 다르고, 표준산소농도가 입력된 경우에만 보정 진행
        if (oxygen < 20.9 && !isNaN(standardOxygenRaw)) {
            c = rawConcentration * ((21 - standardOxygenRaw) / (21 - oxygen));
        }

        // 3. Update UI
        document.getElementById('res-vs').innerHTML = `${vs.toFixed(4)} <span>Sm³</span>`;
        if (selectedItem === '먼지') {
            document.getElementById('res-c').innerHTML = `${c.toFixed(2)} <span>mg/Sm³</span>`;
        } else {
            document.getElementById('res-c').innerHTML = `${c.toFixed(2)} <span>ppm</span>`;
        }
        
        resultSection.classList.remove('hidden');
        setTimeout(() => {
            resultSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
    });

    // 4. Report Generation
    reportBtn.addEventListener('click', () => {
        // 사업장명 가져오기
        let workplaceName = '미지정 사업장';
        if (workplaceSelect.selectedIndex > 0) {
            workplaceName = workplaceSelect.options[workplaceSelect.selectedIndex].text;
        }
        
        const today = new Date();
        const dateString = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`;
        
        // 엑셀 '반기별 자가측정 결과보고서' 양식에 매핑
        document.getElementById('rep-workplace').innerText = workplaceName;
        document.getElementById('rep-vent').innerText = ventSelect.value || '-';
        document.getElementById('rep-date').innerText = dateString;
        document.getElementById('rep-today-date').innerText = dateString;
        document.getElementById('rep-submitter').innerText = workplaceName; // 제출인은 해당 사업장
        document.getElementById('rep-item').innerText = targetItemSelect.value || '-';
        
        // 최종 산출된 보정 농도 적용 (DOM 요소 파싱)
        const resCText = document.getElementById('res-c').innerText;
        const finalC = parseFloat(resCText) || 0;
        const unit = resCText.includes('mg') ? 'mg/Sm³' : 'ppm';
        document.getElementById('rep-c').innerText = finalC.toFixed(2) + ' ' + unit;
        const oxygenValue = parseFloat(document.getElementById('oxygen').value) || 20.9;

        if (typeof Templates !== 'undefined') {
            // 밀도 방식(ro) 산출
            let calcRo = 1.3;
            if (document.getElementById('gas-density-type').value === 'custom') {
                const co2 = parseFloat(document.getElementById('comp-co2').value) || 0;
                const o2 = parseFloat(document.getElementById('comp-o2').value) || 0;
                const n2 = parseFloat(document.getElementById('comp-n2').value) || 0;
                const M = (44 * co2 + 32 * o2 + 28 * n2) / 100;
                calcRo = M / 22.4;
            }

            const advData = {
                workplaceName: workplaceName,
                sampler: authNameSelect.value || '지정안됨',
                date: dateString,
                temp: parseFloat(document.getElementById('temp').value) || 26,
                press: parseFloat(document.getElementById('pressure').value) || 751.7,
                oxygen: oxygenValue,
                item: targetItemSelect.value,
                unit: unit,
                C: finalC.toFixed(2),
                ro: calcRo.toFixed(4),
                humidity: parseFloat(document.getElementById('adv-humidity').value) || 88,
                windDir: document.getElementById('adv-wind-dir').value || '남남서',
                windSpeed: parseFloat(document.getElementById('adv-wind-speed').value) || 3.4,
                ps: parseFloat(document.getElementById('adv-ps').value) || -0.55,
                h: parseFloat(document.getElementById('adv-h').value) || 8.8,
                dh: parseFloat(document.getElementById('adv-dh').value) || 29.8,
                tm: parseFloat(document.getElementById('adv-tm').value) || 27.5,
                vic: parseFloat(document.getElementById('adv-vic').value) || 6.5,
                nozzle: parseFloat(document.getElementById('adv-nozzle').value) || 0.622,
                time: parseFloat(document.getElementById('adv-time').value) || 22,
                vm: parseFloat(document.getElementById('adv-vm').value) || 401.9,
            };

            // 복잡한 엑셀 수식 계산
            // 1. 수분량 Xw
            const Pa = advData.press;
            const Pm = advData.dh / 13.6; 
            const Xw_num = (22.4 * advData.vic) / 18;
            const Xw_den = (advData.vm * 273 * (Pa + Pm)) / ((273 + advData.tm) * 760) + Xw_num;
            advData.Xw = ((Xw_num / Xw_den) * 100).toFixed(2);

            // 2. 가스밀도 r
            advData.r = (calcRo * 273 / (273 + advData.temp) * (Pa + advData.ps) / 760).toFixed(4);

            // 3. 가스유속 v
            const C_pitot = 0.84;
            const g = 9.81;
            advData.v = (C_pitot * Math.sqrt(2 * g * advData.h / parseFloat(advData.r))).toFixed(2);

            // 4. 배출가스량 Q (직경 0.8m 원형 기준 가정)
            const area = 0.64; // 임의 면적
            advData.Q = (advData.v * area * 3600 * 273 / (273 + advData.temp) * (Pa + advData.ps) / 760 * (1 - advData.Xw/100)).toFixed(1);

            // 5. 등속흡인계수 I
            const An = (Math.PI * Math.pow(advData.nozzle/2, 2));
            const I_val = (273 + advData.temp) * (0.00346 * advData.vic + advData.vm / ((273+advData.tm)*(Pa + Pm))) / ((Pa + advData.ps) * advData.time * advData.v * An) * 1.667 * 10000;
            advData.I = I_val.toFixed(2);

            // HTML에 삽입
            document.getElementById('record1-container').innerHTML = Templates.record1(advData);
            document.getElementById('record2-container').innerHTML = Templates.record2(advData);
            document.getElementById('record3-container').innerHTML = Templates.record3(advData);

            // 실제 원본 엑셀(.xlsx) 다운로드용 데이터 구성
            // (업체/배출구별 실제 정보는 DB에서, 측정값/계산결과는 위 계산 로직에서 가져옴)
            const selectedCompany = workplaceSelect.value;
            const companyInfo = (typeof DB !== 'undefined' && DB.companies[selectedCompany]) || null;
            const ventDetail = companyInfo && companyInfo.ventDetails
                ? companyInfo.ventDetails.find(v => String(v.ventNum) === String(ventSelect.value))
                : null;
            const standardOxygenVal = parseFloat(standardOxygenInput.value);

            lastReportCtx = {
                companyInfo, ventDetail,
                workplaceName, ventNum: ventSelect.value || '-', dateString,
                sampler: advData.sampler, item: advData.item, unit: advData.unit, C: advData.C,
                temp: advData.temp, humidity: advData.humidity, press: advData.press,
                windDir: advData.windDir, v: advData.v, Xw: advData.Xw,
                oxygen: advData.oxygen, standardOxygen: isNaN(standardOxygenVal) ? null : standardOxygenVal,
                Q: advData.Q, I: advData.I, time: advData.time, vm: advData.vm,
            };
        }

        // 모달 열기
        modal.classList.remove('hidden');
        setTimeout(() => modal.classList.add('show'), 10);
    });

    // 엑셀(.xlsx) 다운로드 버튼들 — 실제 원본 서식 그대로 값만 채워서 다운로드
    async function handleExcelDownload(btn, fn) {
        if (!lastReportCtx) {
            alert('먼저 "법정 성적서 발행하기" 버튼으로 성적서를 생성해주세요.');
            return;
        }
        const originalHtml = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> 생성 중...';
        try {
            await fn(lastReportCtx);
        } catch (err) {
            console.error(err);
            alert('엑셀 파일 생성 중 오류가 발생했습니다: ' + err.message);
        } finally {
            btn.disabled = false;
            btn.innerHTML = originalHtml;
        }
    }

    const downloadAllXlsxBtn = document.getElementById('download-all-xlsx-btn');
    if (downloadAllXlsxBtn) {
        downloadAllXlsxBtn.addEventListener('click', () => handleExcelDownload(downloadAllXlsxBtn, ExcelExport.downloadCombined));
    }

    const closeModal = () => {
        modal.classList.remove('show');
        setTimeout(() => modal.classList.add('hidden'), 300);
    };

    closeModalBtn.addEventListener('click', closeModal);
    closeModalBottomBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    // 5. 거래명세표 발행
    const statementModal = document.getElementById('statement-modal');
    const openStatementBtn = document.getElementById('open-statement-btn');
    const closeStatementModalBtn = document.getElementById('close-statement-modal');
    const closeStatementModalBottomBtn = document.getElementById('close-statement-modal-bottom');
    const stmtCompanyInput = document.getElementById('stmt-company');
    const stmtItemsTable = document.getElementById('stmt-items-table');
    const downloadStatementXlsxBtn = document.getElementById('download-statement-xlsx-btn');

    function recalcStatement() {
        let totalSupply = 0, totalTax = 0;
        stmtItemsTable.querySelectorAll('tbody tr, tr').forEach(row => {
            const qtyInput = row.querySelector('.stmt-qty');
            const priceInput = row.querySelector('.stmt-price');
            if (!qtyInput || !priceInput) return;
            const qty = parseFloat(qtyInput.value) || 0;
            const price = parseFloat(priceInput.value) || 0;
            const supply = Math.round(qty * price);
            const tax = Math.round(supply * 0.1);
            row.querySelector('.stmt-supply').innerText = supply.toLocaleString();
            row.querySelector('.stmt-tax').innerText = tax.toLocaleString();
            totalSupply += supply;
            totalTax += tax;
        });
        document.getElementById('stmt-total-supply').innerText = totalSupply.toLocaleString();
        document.getElementById('stmt-total-tax').innerText = totalTax.toLocaleString();
        document.getElementById('stmt-grand-total').innerText = (totalSupply + totalTax).toLocaleString();
    }

    if (openStatementBtn) {
        openStatementBtn.addEventListener('click', () => {
            const selectedCompany = workplaceSelect.value;
            if (!selectedCompany) {
                alert('먼저 사업장을 선택해주세요.');
                return;
            }
            const workplaceName = workplaceSelect.options[workplaceSelect.selectedIndex].text;
            stmtCompanyInput.value = workplaceName;

            // 배출구별 시설명을 품목명 기본값으로 미리 채워줌 (수정 가능)
            const companyInfo = (typeof DB !== 'undefined' && DB.companies[selectedCompany]) || null;
            const facilityNames = (companyInfo && companyInfo.ventDetails)
                ? [...new Set(companyInfo.ventDetails.map(v => v.facilityType).filter(Boolean))]
                : [];
            const nameInputs = stmtItemsTable.querySelectorAll('.stmt-name');
            nameInputs.forEach((input, idx) => {
                if (!input.value && facilityNames[idx]) input.value = facilityNames[idx];
            });
            if (nameInputs.length > 2 && !nameInputs[2].value) nameInputs[2].value = '출장수수료';

            recalcStatement();
            statementModal.classList.remove('hidden');
            setTimeout(() => statementModal.classList.add('show'), 10);
        });
    }

    stmtItemsTable.querySelectorAll('.stmt-qty, .stmt-price').forEach(input => {
        input.addEventListener('input', recalcStatement);
    });

    const closeStatementModal = () => {
        statementModal.classList.remove('show');
        setTimeout(() => statementModal.classList.add('hidden'), 300);
    };
    if (closeStatementModalBtn) closeStatementModalBtn.addEventListener('click', closeStatementModal);
    if (closeStatementModalBottomBtn) closeStatementModalBottomBtn.addEventListener('click', closeStatementModal);
    statementModal.addEventListener('click', (e) => {
        if (e.target === statementModal) closeStatementModal();
    });

    if (downloadStatementXlsxBtn) {
        downloadStatementXlsxBtn.addEventListener('click', async () => {
            const selectedCompany = workplaceSelect.value;
            const companyInfo = (typeof DB !== 'undefined' && DB.companies[selectedCompany]) || null;
            const workplaceName = stmtCompanyInput.value;
            const items = [];
            const rows = stmtItemsTable.querySelectorAll('tr');
            rows.forEach(row => {
                const nameInput = row.querySelector('.stmt-name');
                const qtyInput = row.querySelector('.stmt-qty');
                const priceInput = row.querySelector('.stmt-price');
                if (!nameInput || !qtyInput || !priceInput) return;
                if (!nameInput.value) return;
                items.push({
                    name: nameInput.value,
                    qty: parseFloat(qtyInput.value) || 0,
                    price: parseFloat(priceInput.value) || 0,
                });
            });
            if (items.length === 0) {
                alert('품목을 1개 이상 입력해주세요.');
                return;
            }
            const originalHtml = downloadStatementXlsxBtn.innerHTML;
            downloadStatementXlsxBtn.disabled = true;
            downloadStatementXlsxBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> 생성 중...';
            try {
                await ExcelExport.downloadStatement({ companyInfo, workplaceName, items });
            } catch (err) {
                console.error(err);
                alert('엑셀 파일 생성 중 오류가 발생했습니다: ' + err.message);
            } finally {
                downloadStatementXlsxBtn.disabled = false;
                downloadStatementXlsxBtn.innerHTML = originalHtml;
            }
        });
    }
});

// Global functions for UI controls
function toggleGasInputs() {
    const gasType = document.getElementById('gas-density-type').value;
    const gasInputs = document.getElementById('gas-comp-inputs');
    if (gasType === 'custom') {
        gasInputs.classList.remove('hidden');
    } else {
        gasInputs.classList.add('hidden');
    }
}

function toggleAdvanced() {
    const advInputs = document.getElementById('advanced-inputs');
    const advChevron = document.getElementById('adv-chevron');
    if (advInputs.classList.contains('hidden')) {
        advInputs.classList.remove('hidden');
        advChevron.style.transform = 'rotate(180deg)';
    } else {
        advInputs.classList.add('hidden');
        advChevron.style.transform = 'rotate(0deg)';
    }
}

function switchTab(tabId) {
    // Hide all tabs
    document.querySelectorAll('.print-page').forEach(el => el.style.display = 'none');
    // Remove active class from all buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        btn.style.background = 'white';
        btn.style.color = '#475569';
        btn.style.border = '1px solid #cbd5e1';
        btn.style.fontWeight = 'normal';
    });
    
    // Show selected tab
    document.getElementById(tabId).style.display = 'block';
    // Highlight button
    const activeBtn = Array.from(document.querySelectorAll('.tab-btn')).find(btn => btn.getAttribute('onclick').includes(tabId));
    if (activeBtn) {
        activeBtn.classList.add('active');
        activeBtn.style.background = 'var(--primary)';
        activeBtn.style.color = 'white';
        activeBtn.style.border = 'none';
        activeBtn.style.fontWeight = 'bold';
    }
}
