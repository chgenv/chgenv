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

    // 0. Authentication Logic
    const loginScreen = document.getElementById('login-screen');
    const mainApp = document.getElementById('main-app');
    const adminPanel = document.getElementById('admin-panel');
    const authBtn = document.getElementById('auth-btn');
    const authNameSelect = document.getElementById('auth-name');
    const authCodeInput = document.getElementById('auth-code');
    const authMsg = document.getElementById('auth-msg');

    // Admin configuration
    const adminAccessCode = '9999'; // Default admin login code
    // Retrieve unified code from localStorage, default to '1234'
    let currentUnifiedCode = localStorage.getItem('unifiedEmployeeCode') || '1234';

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
            // Employee Login
            if (code === currentUnifiedCode) {
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

    // Admin Panel Logic
    document.getElementById('change-code-btn').addEventListener('click', () => {
        const newCode = document.getElementById('new-auth-code').value;
        if (!newCode || newCode.length < 4) {
            alert('새로운 보안코드를 4자리 이상 입력해주세요.');
            return;
        }
        
        localStorage.setItem('unifiedEmployeeCode', newCode);
        currentUnifiedCode = newCode;
        alert('모든 직원의 통일 보안코드가 성공적으로 변경되었습니다!');
        document.getElementById('new-auth-code').value = '';
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
    }

    const itemCheckboxesContainer = document.getElementById('item-checkboxes');
    const dynamicCInputsContainer = document.getElementById('dynamic-c-inputs');

    function renderCheckboxes() {
        itemCheckboxesContainer.innerHTML = '';
        DB.allItems.sort().forEach(item => {
            const label = document.createElement('label');
            label.style.display = 'flex';
            label.style.alignItems = 'center';
            label.style.gap = '5px';
            label.style.cursor = 'pointer';

            const cb = document.createElement('input');
            cb.type = 'checkbox';
            cb.value = item;
            cb.className = 'item-cb';
            cb.addEventListener('change', renderDynamicInputs);

            label.appendChild(cb);
            label.appendChild(document.createTextNode(item));
            itemCheckboxesContainer.appendChild(label);
        });
    }

    function renderDynamicInputs() {
        const checkedItems = Array.from(document.querySelectorAll('.item-cb:checked')).map(cb => cb.value);
        dynamicCInputsContainer.innerHTML = '';

        if (checkedItems.length === 0) {
            dynamicCInputsContainer.innerHTML = '<span style="color: #94a3b8; font-size: 0.9rem;">측정 항목을 선택하면 농도 입력칸이 표시됩니다.</span>';
            return;
        }

        checkedItems.forEach(item => {
            const unit = item === '먼지' ? 'mg' : 'ppm';
            const div = document.createElement('div');
            div.className = 'data-item';
            div.innerHTML = `
                <label>분석기 측정값 - ${item} (${unit})</label>
                <input type="number" class="raw-value-input" data-item="${item}" step="0.001" placeholder="${item} 값을 입력하세요">
            `;
            dynamicCInputsContainer.appendChild(div);
        });
    }

    // Handle Workplace Change -> Update Vent Numbers and Items
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
            renderCheckboxes();
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
    // Store the processed items globally so report can use them
    let processedItemsData = [];

    calcBtn.addEventListener('click', () => {
        const temp = parseFloat(tempInput.value);
        const pressure = parseFloat(pressureInput.value);
        const oxygen = parseFloat(oxygenInput.value);
        const volume = parseFloat(volumeInput.value);
        const pipeLength = parseFloat(pipeLengthInput.value);
        
        const rawInputs = document.querySelectorAll('.raw-value-input');
        if (rawInputs.length === 0) {
            alert('최소 1개 이상의 측정 항목을 선택해주세요.');
            return;
        }

        let isMissingRaw = false;
        rawInputs.forEach(input => {
            if (isNaN(parseFloat(input.value))) isMissingRaw = true;
        });

        // Validation
        if (isNaN(temp) || isNaN(pressure) || isNaN(oxygen) || isNaN(volume) || isNaN(pipeLength) || isMissingRaw) {
            alert('인식된 데이터 또는 분석기 측정값이 누락되었습니다. 빈칸을 모두 채워주세요.');
            return;
        }

        // 가. 표준상태 부피 (Vs) 계산
        const deadVolume = pipeLength * 0.0001; 
        const adjustedVolume = volume - deadVolume;
        const vs = adjustedVolume * (293.15 / (273.15 + temp)) * (pressure / 760);
        
        processedItemsData = [];
        
        rawInputs.forEach(input => {
            const item = input.getAttribute('data-item');
            const rawValue = parseFloat(input.value);
            
            let rawConcentration = rawValue;
            if (item === '먼지') {
                rawConcentration = rawValue / vs; 
            }
            
            const standardOxygen = 10; 
            let c = rawConcentration;
            
            if (oxygen < 20.9) {
                c = rawConcentration * ((21 - standardOxygen) / (21 - oxygen));
            }
            
            processedItemsData.push({
                name: item,
                raw: rawValue,
                finalC: c.toFixed(2),
                unit: item === '먼지' ? 'mg/Sm³' : 'ppm'
            });
        });

        // 3. Update UI
        document.getElementById('res-vs').innerHTML = `${vs.toFixed(4)} <span>Sm³</span>`;
        
        let cResultHtml = processedItemsData.map(item => `${item.name}: ${item.finalC} <span>${item.unit}</span>`).join('<br>');
        document.getElementById('res-c').innerHTML = cResultHtml;
        
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
        
        let repItemText = processedItemsData.map(i => i.name).join(', ');
        document.getElementById('rep-item').innerText = repItemText || '-';
        
        let repCText = processedItemsData.map(i => `${i.name}: ${i.finalC} ${i.unit}`).join('\n');
        document.getElementById('rep-c').innerText = repCText;
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
                facilityType: document.getElementById('facility-type').value || '기타시설',
                sampler: authNameSelect.value || '지정안됨',
                date: dateString,
                temp: parseFloat(document.getElementById('temp').value) || 26,
                press: parseFloat(document.getElementById('pressure').value) || 751.7,
                oxygen: oxygenValue,
                items: processedItemsData,
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

            const invoiceItems = Array.from(document.querySelectorAll('.invoice-row')).map(row => {
                const name = row.querySelector('.inv-name').value;
                const qtyVal = row.querySelector('.inv-qty').value;
                const priceVal = row.querySelector('.inv-price').value;
                return {
                    month: new Date().getMonth() + 1,
                    day: new Date().getDate(),
                    name: name,
                    qty: qtyVal ? parseFloat(qtyVal) : '',
                    price: priceVal ? parseFloat(priceVal) : '',
                    spec: ''
                };
            }).filter(item => item.name || item.price !== '');

            let totalSupply = 0;
            let totalTax = 0;
            invoiceItems.forEach(item => {
                if (item.qty !== '' && item.price !== '') {
                    totalSupply += item.qty * item.price;
                    totalTax += (item.qty * item.price) * 0.1;
                }
            });
            advData.invoiceItems = invoiceItems;
            advData.totalSupply = totalSupply;
            advData.totalTax = totalTax;
            advData.totalAmount = totalSupply + totalTax;

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
            document.getElementById('record4-container').innerHTML = Templates.record4(advData);
        }

        // 모달 열기
        modal.classList.remove('hidden');
        setTimeout(() => modal.classList.add('show'), 10);
    });

    const closeModal = () => {
        modal.classList.remove('show');
        setTimeout(() => modal.classList.add('hidden'), 300);
    };

    closeModalBtn.addEventListener('click', closeModal);
    closeModalBottomBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
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

document.addEventListener('DOMContentLoaded', () => {
    // Invoice Dynamic Rows Logic
    const addInvoiceBtn = document.getElementById('add-invoice-btn');
    const invoiceContainer = document.getElementById('invoice-items-container');

    if (addInvoiceBtn && invoiceContainer) {
        addInvoiceBtn.addEventListener('click', () => {
            const row = document.createElement('div');
            row.className = 'invoice-row';
            row.style.display = 'flex';
            row.style.gap = '10px';
            row.style.marginBottom = '8px';
            row.innerHTML = `
                <input type="text" class="inv-name" placeholder="품목 (예: 도장시설 측정비)" style="flex:2; border: 1px solid #cbd5e1; border-radius: 4px; padding: 6px;">
                <input type="number" class="inv-qty" placeholder="수량" style="flex:1; border: 1px solid #cbd5e1; border-radius: 4px; padding: 6px;">
                <input type="number" class="inv-price" step="10000" placeholder="단가" style="flex:2; border: 1px solid #cbd5e1; border-radius: 4px; padding: 6px;">
                <button type="button" class="remove-inv-row" style="background:none; border:none; color:#ef4444; cursor:pointer; padding:5px;"><i class="fa-solid fa-xmark"></i></button>
            `;
            invoiceContainer.appendChild(row);
        });

        invoiceContainer.addEventListener('click', (e) => {
            if (e.target.closest('.remove-inv-row')) {
                const row = e.target.closest('.invoice-row');
                if (invoiceContainer.children.length > 1) {
                    row.remove();
                } else {
                    // Just clear the inputs if it's the last row
                    row.querySelector('.inv-name').value = '';
                    row.querySelector('.inv-qty').value = '';
                    row.querySelector('.inv-price').value = '';
                }
            }
        });
    }
});

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
