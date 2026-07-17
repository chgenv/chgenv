// templates.js - 복잡한 보고서 HTML 템플릿 보관

const Templates = {
    record1: (data) => `
        <table class="excel-table">
            <tr>
                <td colspan="2" style="font-weight:bold; font-size:1.4rem; height:50px; border:none; border-bottom: 2px solid #000;">대기시료채취 및 시료접수 기록부</td>
            </tr>
            <tr>
                <td style="font-weight:bold; width: 25%;">시료채취번호</td>
                <td style="width: 25%;">26070601B</td>
                <td style="font-weight:bold; width: 25%;">시료채취일시</td>
                <td style="width: 25%;">${data.date}</td>
            </tr>
            <tr>
                <td colspan="2" style="font-weight:bold; letter-spacing: 5px;">배 출 업 소</td>
                <td colspan="2" style="font-weight:bold; letter-spacing: 5px;">측 정 대 행 업 소</td>
            </tr>
            <tr>
                <td style="font-weight:bold;">업 소 명</td>
                <td>${data.workplaceName}</td>
                <td style="font-weight:bold;">업 소 명</td>
                <td>㈜충남환경</td>
            </tr>
            <tr>
                <td style="font-weight:bold;">소 재 지</td>
                <td>해당 주소지</td>
                <td style="font-weight:bold;">소 재 지</td>
                <td>충남 공주시 백미고을길 10-9, 2F</td>
            </tr>
            <tr>
                <td style="font-weight:bold;">대 표 자</td>
                <td>대표이사</td>
                <td style="font-weight:bold;">대 표 자</td>
                <td>박종혁, 최천</td>
            </tr>
            <tr>
                <td style="font-weight:bold;">시 설 관 리 인</td>
                <td>변훈규</td>
                <td style="font-weight:bold;">시 료 채 취 자 ( 정 )</td>
                <td>${data.sampler} <span style="float:right; margin-right:5px;">[서 명]</span></td>
            </tr>
            <tr>
                <td style="font-weight:bold;">시 설 별</td>
                <td>도장시설(건조포함)</td>
                <td style="font-weight:bold;">시 료 채 취 자 ( 부 )</td>
                <td>채진석 <span style="float:right; margin-right:5px;">[서 명]</span></td>
            </tr>
            <tr>
                <td style="font-weight:bold; letter-spacing: 2px;">굴 뚝 종 별</td>
                <td colspan="3">5 종</td>
            </tr>
            <tr>
                <td style="font-weight:bold; letter-spacing: 2px;">방 지 시 설</td>
                <td>여과및흡착에의한시설</td>
                <td colspan="2" style="text-align:left; padding-left:10px;">350 m³/분</td>
            </tr>
        </table>

        <div class="excel-section-title">1. 연 도 조 건</div>
        <table class="excel-table" style="width: 40%; margin-bottom:5px;">
            <tr>
                <td colspan="3" style="font-weight:bold;">직 경 (m)</td>
            </tr>
            <tr>
                <td>원형</td>
                <td>가로</td>
                <td>세로</td>
            </tr>
            <tr>
                <td>0.00</td>
                <td>0.80</td>
                <td>0.80</td>
            </tr>
        </table>

        <div class="excel-section-title">2. 기 후 조 건</div>
        <table class="excel-table">
            <tr>
                <td style="font-weight:bold;">기온(℃)</td>
                <td style="font-weight:bold;">습도(%)</td>
                <td style="font-weight:bold;">기압(mmHg)</td>
                <td style="font-weight:bold;">풍향</td>
                <td style="font-weight:bold;">풍속(m/s)</td>
            </tr>
            <tr>
                <td>${data.temp}</td>
                <td>${data.humidity}</td>
                <td>${data.press}</td>
                <td>${data.windDir}</td>
                <td>${data.windSpeed}</td>
            </tr>
        </table>

        <div class="excel-section-title">3. 측 정 조 건</div>
        <table class="excel-table">
            <tr>
                <td colspan="3" style="font-weight:bold; letter-spacing: 5px;">수 분 측 정</td>
                <td colspan="6" style="font-weight:bold; letter-spacing: 5px;">배 출 가 스</td>
            </tr>
            <tr>
                <td style="font-weight:bold;">흡인가스량<br>Vm<br>(L)</td>
                <td style="font-weight:bold;">수분무게<br>ma<br>(g)</td>
                <td style="font-weight:bold;">수분량<br>Xm<br>(%)</td>
                <td style="font-weight:bold;">습가스밀도<br>ro<br>(kg/m3)</td>
                <td style="font-weight:bold;">배출가스밀도<br>r<br>(kg/m3)</td>
                <td style="font-weight:bold;">배출가스온도<br>Θs<br>(℃)</td>
                <td style="font-weight:bold;">정압<br>Ps<br>(mmHg)</td>
                <td style="font-weight:bold;">동압<br>h<br>(mmH2O)</td>
                <td style="font-weight:bold;">유속<br>V<br>(m/s)</td>
            </tr>
            <tr>
                <td>${data.vm}</td>
                <td>${data.vic}</td>
                <td>${data.Xw}</td>
                <td>${data.ro}</td>
                <td>${data.r}</td>
                <td>26</td>
                <td>${data.ps}</td>
                <td>${data.h}</td>
                <td class="highlight-val">${data.v}</td>
            </tr>
            <tr>
                <td colspan="1" style="font-weight:bold;">배출가스</td>
                <td colspan="8" style="font-weight:bold; letter-spacing: 5px;">등 속 흡 인</td>
            </tr>
            <tr>
                <td style="font-weight:bold;">대기압<br>Pa<br>(mmHg)</td>
                <td colspan="2" style="font-weight:bold;">오리피스차압<br>ΔH<br>(mmH2O)</td>
                <td colspan="2" style="font-weight:bold;">등속흡인계수<br>I<br>(%)</td>
                <td colspan="2" style="font-weight:bold;">가스미터에서의<br>가스게이지압<br>(mmHg)</td>
                <td style="font-weight:bold;">채취량<br>V'm<br>(m3)</td>
                <td style="font-weight:bold;">흡인노즐내경<br>d<br>(cm)</td>
            </tr>
            <tr>
                <td>${data.press}</td>
                <td colspan="2">${data.dh}</td>
                <td colspan="2" class="highlight-val">${data.I}</td>
                <td colspan="2">3.740</td>
                <td>${(data.vm/1000).toFixed(4)}</td>
                <td>${data.nozzle}</td>
            </tr>
        </table>

        <div class="excel-section-title">4. 가스미터 흡인가스량 V (L)</div>
        <table class="excel-table">
            <tr>
                <td style="height:25px; width:10%;"></td><td style="width:10%;"></td><td style="width:10%;"></td><td style="width:10%;"></td><td style="width:10%;"></td><td style="width:10%;"></td><td style="width:10%;"></td><td style="width:10%;"></td><td style="width:10%;"></td><td style="width:10%;"></td>
            </tr>
            <tr>
                <td style="height:25px;"></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
            </tr>
        </table>

        <div class="excel-section-title">5. 시 료 접 수</div>
        <table class="excel-table" style="width: 50%; float:left;">
            <tr>
                <td style="font-size:0.6rem;">먼지</td>
                <td style="font-size:0.6rem;">SOx</td>
                <td style="font-size:0.6rem;">NOx</td>
                <td style="font-size:0.6rem;">NH3</td>
                <td style="font-size:0.6rem;">CS2</td>
                <td style="font-size:0.6rem;">H2S</td>
                <td style="font-size:0.6rem;">매연</td>
                <td style="font-size:0.6rem;">CO</td>
                <td style="font-size:0.6rem;">THC</td>
                <td style="font-size:0.6rem;">HCl</td>
                <td style="font-size:0.6rem;">HCN</td>
                <td style="font-size:0.6rem;">페놀<br>화합물</td>
                <td style="font-size:0.6rem;">브롬민<br>화합물</td>
            </tr>
            <tr>
                <td style="height:20px;">${data.item === '먼지' ? 'V' : ''}</td>
                <td></td><td></td><td></td><td></td><td></td><td></td><td></td>
                <td>${data.item !== '먼지' ? 'V' : ''}</td>
                <td></td><td></td><td></td><td></td>
            </tr>
        </table>
        
        <table class="excel-table" style="width: 40%; float:right; margin-top:10px;">
            <tr>
                <td style="font-weight:bold; width: 30%; height:40px;">분 석 책 임 자</td>
                <td style="text-align: right; padding-right: 10px;">안 우 정 <span style="margin-left: 20px;">[서 명]</span></td>
            </tr>
        </table>
        <div style="clear:both;"></div>
    `,
    
    record2: (data) => `
        <table style="width:100%; margin-bottom: 5px;">
            <tr>
                <td style="width:20%; font-size:0.7rem;">[별지제21호서식]<br>&lt;개정2024.11.01&gt;</td>
                <td style="width:50%; font-size:1.6rem; font-weight:bold; text-align:center; letter-spacing:10px; border:2px solid #000;">대 기 측 정 기 록 부</td>
                <td style="width:30%; text-align:right; font-size:0.8rem; font-weight:bold;">성적서 NO : &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;26070601B</td>
            </tr>
        </table>

        <table class="excel-table">
            <tr>
                <td rowspan="4" style="width:4%; border-left: 3px solid #000; border-top: 3px solid #000;">①<br>의<br>뢰<br>인</td>
                <td style="width:15%; border-top: 3px solid #000;">상호(기관명) : </td><td colspan="3" style="text-align:left; padding-left:5px; border-top: 3px solid #000;">${data.workplaceName}</td>
                <td rowspan="4" style="width:4%; border-top: 3px solid #000;">②<br>인<br>원<br>현<br>황</td>
                <td style="width:12%; border-top: 3px solid #000;">시 설 명 : </td><td colspan="3" style="text-align:left; padding-left:5px; border-top: 3px solid #000; border-right: 3px solid #000;">도장시설(건조포함)</td>
            </tr>
            <tr>
                <td>소재지(주소) : </td><td colspan="3" style="text-align:left; padding-left:5px;">해당 주소지</td>
                <td>종 규 모 : </td><td colspan="3" style="text-align:left; padding-left:5px; border-right: 3px solid #000;">4 종</td>
            </tr>
            <tr>
                <td>대표자(의뢰인) : </td><td colspan="3" style="text-align:left; padding-left:5px;">대표이사</td>
                <td>생 산 품 : </td><td colspan="3" style="text-align:left; padding-left:5px; border-right: 3px solid #000;">-</td>
            </tr>
            <tr>
                <td>환경기술인 : </td><td colspan="3" style="text-align:left; padding-left:5px;">변훈규</td>
                <td>배출구 NO : </td><td colspan="3" style="text-align:left; padding-left:5px; border-right: 3px solid #000;">4</td>
            </tr>
            
            <tr>
                <td rowspan="4" style="border-left: 3px solid #000; border-top: 3px solid #000;">③<br>의<br>뢰<br>내<br>용</td>
                <td style="border-top: 3px solid #000;">측 정 용 도 : </td><td colspan="8" style="text-align:left; padding-left:5px; border-top: 3px solid #000; border-right: 3px solid #000;">대기환경보전법 39조 및 시행규칙 52조 규정 시료검사</td>
            </tr>
            <tr>
                <td rowspan="2">대상의 명칭<br>[측정지점] : </td>
                <td colspan="2" class="bg-gray">굴뚝 명칭</td>
                <td class="bg-gray">용 량</td>
                <td class="bg-gray">높 이</td>
                <td colspan="2" class="bg-gray">안지름(측정공)</td>
                <td class="bg-gray">굴뚝 종별</td>
                <td class="bg-gray" style="border-right: 3px solid #000;">방 지 효 율</td>
            </tr>
            <tr>
                <td colspan="2">여과및흡착에의한시설</td>
                <td>350 m³/분</td>
                <td>4.0 m</td>
                <td>원형: -</td>
                <td>사각: 0.80 x 0.80</td>
                <td>5 종</td>
                <td style="border-right: 3px solid #000;">70 %</td>
            </tr>
            <tr>
                <td>의 뢰 항 목 : </td><td colspan="8" style="text-align:left; padding-left:5px; border-right: 3px solid #000;">먼지, 탄화수소</td>
            </tr>

            <tr>
                <td rowspan="5" style="border-left: 3px solid #000; border-top: 3px solid #000;">④<br>시<br>료<br>채<br>취</td>
                <td colspan="2" class="bg-gray" style="border-top: 3px solid #000;">날 씨</td>
                <td colspan="2" class="bg-gray" style="border-top: 3px solid #000;">기 온</td>
                <td colspan="2" class="bg-gray" style="border-top: 3px solid #000;">습 도</td>
                <td colspan="2" class="bg-gray" style="border-top: 3px solid #000;">기 압</td>
                <td class="bg-gray" style="border-top: 3px solid #000; border-right: 3px solid #000;">풍 향</td>
            </tr>
            <tr>
                <td colspan="2">비</td>
                <td colspan="2">${data.temp} ℃</td>
                <td colspan="2">${data.humidity} %</td>
                <td colspan="2">${data.press} mmHg</td>
                <td style="border-right: 3px solid #000;">${data.windDir}</td>
            </tr>
            <tr>
                <td colspan="2" class="bg-gray">배출가스유량</td>
                <td colspan="2" class="bg-gray">가스미터 누적량(L)</td>
                <td class="bg-gray">가스유속</td>
                <td class="bg-gray">표준산소</td>
                <td class="bg-gray">실측산소</td>
                <td class="bg-gray">수분량</td>
                <td class="bg-gray" style="border-right: 3px solid #000;">가스온도</td>
            </tr>
            <tr>
                <td>Sm³/h</td><td>Sm³/분</td>
                <td>시작눈금</td><td>끝눈금</td>
                <td>m/s</td><td>%</td><td>%</td><td>%</td><td style="border-right: 3px solid #000;">℃</td>
            </tr>
            <tr>
                <td>${data.Q}</td><td>${(data.Q/60).toFixed(2)}</td>
                <td>-</td><td>-</td>
                <td class="highlight-val">${data.v}</td>
                <td>20.95</td><td>${data.oxygen}</td>
                <td class="highlight-val">${data.Xw}</td>
                <td style="border-right: 3px solid #000;">${data.temp}</td>
            </tr>
            <tr>
                <td rowspan="2" style="border-left: 3px solid #000;"></td>
                <td colspan="2" class="bg-gray">채 취 자 의 견</td>
                <td colspan="2">정상가동 이상무</td>
                <td colspan="2" class="bg-gray">누 출 시 험 검 사</td>
                <td colspan="3" style="border-right: 3px solid #000;">정상가동 이상무</td>
            </tr>
            <tr>
                <td colspan="2" class="bg-gray">채 취 일 시</td>
                <td colspan="2">${data.date} 09:25 - 10:45</td>
                <td colspan="2" class="bg-gray">시 료 채 취 자</td>
                <td colspan="3" style="border-right: 3px solid #000;">${data.sampler} [서 명]</td>
            </tr>

            <tr>
                <td rowspan="4" style="border-left: 3px solid #000; border-top: 3px solid #000;">⑤<br>시<br>설<br>가<br>동</td>
                <td rowspan="2" colspan="2" class="bg-gray" style="border-top: 3px solid #000;">배출시설 명칭</td>
                <td colspan="5" class="bg-gray" style="border-top: 3px solid #000;">측정당시 시간당 사용(생산)량</td>
                <td rowspan="2" colspan="2" class="bg-gray" style="border-top: 3px solid #000; border-right: 3px solid #000;">방지시설 명칭</td>
            </tr>
            <tr>
                <td>연료사용량</td><td colspan="2">제품생산량</td><td>소각량</td><td>원료투입량</td>
            </tr>
            <tr>
                <td colspan="2" rowspan="2">도장시설(건조포함)</td>
                <td>전기사용</td><td colspan="2">0.5 대</td><td>해당 없음</td><td>0.2 L</td>
                <td colspan="2" rowspan="2" style="border-right: 3px solid #000;">여과및흡착에의한시설</td>
            </tr>
            <tr>
                <td style="height:25px;"></td><td colspan="2"></td><td></td><td></td>
            </tr>
            
            <tr>
                <td colspan="10" class="bg-gray" style="text-align:left; padding-left:5px; border-left: 3px solid #000; border-right: 3px solid #000; border-top: 3px solid #000;">⑥ 측정분석 결과</td>
            </tr>
            <tr>
                <td class="bg-gray" style="border-left: 3px solid #000; border-bottom: 3px solid #000;">NO</td>
                <td colspan="2" class="bg-gray" style="border-bottom: 3px solid #000;">측 정 항 목</td>
                <td class="bg-gray" style="border-bottom: 3px solid #000;">단 위</td>
                <td colspan="2" class="bg-gray" style="border-bottom: 3px solid #000;">측 정 분 석 값</td>
                <td class="bg-gray" style="border-bottom: 3px solid #000;">측 정 시 간</td>
                <td class="bg-gray" style="border-bottom: 3px solid #000;">관 련 기 준</td>
                <td colspan="2" class="bg-gray" style="border-right: 3px solid #000; border-bottom: 3px solid #000;">측정분석방법<br>[기기명]</td>
            </tr>
            <tr>
                <td style="height:50px; border-left: 3px solid #000; border-bottom: 3px solid #000;">1</td>
                <td colspan="2" style="border-bottom: 3px solid #000;">${data.item}</td>
                <td style="border-bottom: 3px solid #000;">${data.unit}</td>
                <td colspan="2" class="highlight-val" style="border-bottom: 3px solid #000;">${data.C}</td>
                <td style="border-bottom: 3px solid #000;">09:39 - 10:09</td>
                <td style="border-bottom: 3px solid #000;">-</td>
                <td colspan="2" style="border-right: 3px solid #000; border-bottom: 3px solid #000;">F.I.D (Propane)</td>
            </tr>
        </table>
    `,

    record3: (data) => `
        <div style="font-size:1.4rem; font-weight:bold; text-align:center; letter-spacing:5px; margin-bottom:15px;">먼지시료채취 기록지</div>
        <table class="excel-table" style="margin-bottom:0;">
            <tr>
                <td class="bg-gray" style="width:15%;">업 소 명 : </td>
                <td style="width:25%;">${data.workplaceName}</td>
                <td rowspan="5" style="width:30%; padding:0; border:2px solid #000; text-align:left;">
                    <div style="font-size:0.6rem; padding-left:5px;">Ds: 0.80 m &nbsp;&nbsp;&nbsp; A: 0.6400 m²</div>
                    <div style="display:flex; justify-content:center; margin-top:5px;">
                        <div style="width:60px; height:60px; border:2px solid #000; display:flex; align-items:center; justify-content:center;">
                            <div style="width:10px; height:10px; border-radius:50%; background:#000;"></div>
                        </div>
                    </div>
                </td>
                <td class="bg-gray" style="width:15%;">피토우관계수: </td>
                <td style="width:15%;">0.84</td>
            </tr>
            <tr>
                <td class="bg-gray">측정대상명 : </td>
                <td>도장시설(건조포함)</td>
                <td class="bg-gray">기 온, ℃ : </td>
                <td>${data.temp}</td>
            </tr>
            <tr>
                <td class="bg-gray">측 정 일 : </td>
                <td>${data.date}</td>
                <td class="bg-gray">대 기 압, mmHg: </td>
                <td>${data.press}</td>
            </tr>
            <tr>
                <td class="bg-gray">측 정 번 호 : </td>
                <td>26070601B</td>
                <td class="bg-gray">측정위치의<br>기 압, mmHg: </td>
                <td>${data.press}</td>
            </tr>
            <tr>
                <td class="bg-gray">오리피스미터 ΔH(mmH2O): </td>
                <td>3.02</td>
                <td class="bg-gray">수 분 량(%): </td>
                <td>${data.Xw}</td>
            </tr>
            <tr>
                <td class="bg-gray">산 소 량(%): </td>
                <td>${data.oxygen}</td>
                <td style="font-size:0.7rem;">1번: &nbsp;&nbsp; 0.40 &nbsp;&nbsp; X &nbsp;&nbsp; 0.707 &nbsp;&nbsp; = &nbsp;&nbsp; ##</td>
                <td class="bg-gray">흡인관 길이, m: </td>
                <td>1.6</td>
            </tr>
            <tr>
                <td class="bg-gray">K Factor : </td>
                <td>3.386</td>
                <td class="bg-gray" rowspan="2">굴뚝 직경(m) - 사각</td>
                <td class="bg-gray">가로</td>
                <td>0.80</td>
            </tr>
            <tr>
                <td class="bg-gray">등속흡인계수(%) : </td>
                <td class="highlight-val">${data.I}</td>
                <td class="bg-gray">세로</td>
                <td>0.80</td>
            </tr>
            <tr>
                <td class="bg-gray">굴뚝 직경(m) - 원형</td>
                <td>0.00</td>
                <td class="bg-gray">배출가스정압, mmHg:</td>
                <td colspan="2">${data.ps}</td>
            </tr>
            <tr>
                <td class="bg-gray">굴뚝 단면적(m2)</td>
                <td>0.6400</td>
                <td><span class="bg-gray" style="padding:2px;">습도</span> &nbsp; ${data.humidity} &nbsp; <span class="bg-gray" style="padding:2px;">풍향</span> &nbsp; ${data.windDir} &nbsp; <span class="bg-gray" style="padding:2px;">풍속</span> &nbsp; ${data.windSpeed}</td>
                <td colspan="2"></td>
            </tr>
        </table>
        
        <table class="excel-table" style="margin-top:10px;">
            <tr class="bg-gray">
                <td rowspan="2">채취점<br>번호</td>
                <td rowspan="2">시료채취<br>시간<br>(min)</td>
                <td rowspan="2">진공<br>게이지압<br>(cmHg)</td>
                <td rowspan="2">배출가스<br>온도<br>(℃)</td>
                <td rowspan="2">배출가스<br>동압<br>(mmH2O)</td>
                <td rowspan="2">오리피스<br>압차<br>(mmH2O)</td>
                <td rowspan="2">시료<br>채취량<br>(m3)</td>
                <td colspan="2">건식가스미터<br>에서의 온도(℃)</td>
                <td rowspan="2">여과지<br>홀더온도<br>(℃)</td>
                <td rowspan="2">최종임<br>핀저출구<br>온도(℃)</td>
            </tr>
            <tr class="bg-gray">
                <td>입구</td><td>출구</td>
            </tr>
            <tr>
                <td>R1</td>
                <td>${data.time}</td>
                <td>10</td>
                <td>${data.temp}</td>
                <td>${data.h}</td>
                <td>${data.dh}</td>
                <td>${(data.vm/1000).toFixed(4)}</td>
                <td>28</td>
                <td>27</td>
                <td>-</td>
                <td>16</td>
            </tr>
            <tr><td style="height:20px;"></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
            <tr><td style="height:20px;"></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
            <tr><td style="height:20px;"></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
            <tr class="bg-gray">
                <td>합 계</td>
                <td>${data.time}</td>
                <td>-</td><td>-</td><td>-</td><td>-</td>
                <td>${(data.vm/1000).toFixed(4)}</td>
                <td>평 균</td><td>평 균</td><td>-</td><td>-</td>
            </tr>
            <tr class="bg-gray">
                <td>평 균</td>
                <td></td>
                <td>10</td><td>${data.temp}</td><td>${data.h}</td><td>${data.dh}</td>
                <td>-</td><td>평 균</td><td></td><td>-</td><td>16</td>
            </tr>
        </table>
        
        <div style="font-size:0.7rem; text-align:left; margin-top:15px; line-height:1.5;">
            비고: <br>
            1. 시료채취중 임핀저 통과 후의 가스온도가 20℃가 넘을 경우엔 잘게 부순 얼음을 더 채우거나 소금을 첨가하도록 한다.<br>
            2. 먼지가 포집됨에 따라 여과지에 전후의 압력강화가 너무 높아져 등속흡인을 유지하기가 어려울 경우에 새 여과지로 교환 후 시료채취를 계속한다.
        </div>

        <div style="page-break-before: always; margin-top: 30px;"></div>

        <!-- 3페이지: 등속흡인을 위한 계산 -->
        <div style="font-size:1.3rem; font-weight:bold; text-align:center; margin-bottom:10px;">등속흡인을 위한 계산</div>
        <div style="text-align:right; font-size:0.8rem; margin-bottom:5px;">업 소 명 : 대한자동차1급공업사<br>측 정 일 : ${data.date}</div>
        
        <table class="excel-table">
            <tr class="bg-gray">
                <td style="width:30%;">계 산 식</td>
                <td style="width:70%;">계 산</td>
            </tr>
            <tr>
                <td style="text-align:left; padding:5px;">
                    <div style="font-weight:bold;">수분량 (%)</div>
                    <img src="https://via.placeholder.com/200x50?text=Formula+Xw" alt="수분량 공식" style="width:100%; max-width:200px; display:none;">
                    <div style="font-size:0.7rem; line-height:1.2; text-align:center; border:1px solid #ddd; padding:5px;">
                        Xw = [ (22.4 * ma / 18) / (Vm * 273/(273+Tm) * (Pa+Pm)/760 + (22.4*ma/18)) ] * 100
                    </div>
                </td>
                <td style="text-align:left; padding:10px;">
                    <div style="margin-bottom:10px;">수분량 = <span style="font-weight:bold;">${data.Xw}</span> %</div>
                    <table style="border-collapse:collapse; text-align:center; font-size:0.75rem;">
                        <tr>
                            <td rowspan="3" style="padding-right:10px; font-weight:bold;">Xw = </td>
                            <td style="border-bottom:1px solid #000; padding:0 5px;">22.4 / 18 * ${data.vic}</td>
                            <td rowspan="3" style="padding-left:10px;">X 100</td>
                        </tr>
                        <tr>
                            <td style="padding:0 5px;">${(data.vm/1000).toFixed(4)} X (273 / (273+${data.tm})) X (${data.press} + 3.74) / 760 + (22.4 / 18 * ${data.vic})</td>
                        </tr>
                    </table>
                </td>
            </tr>
            <tr>
                <td style="text-align:left; padding:5px;">
                    <div style="font-weight:bold;">배출가스밀도 (kg/m³)</div>
                    <div style="font-size:0.7rem; line-height:1.2; text-align:center; border:1px solid #ddd; padding:5px; margin-top:5px;">
                        r = ro * (273 / (273+Θs)) * (Pa+Ps)/760
                    </div>
                </td>
                <td style="text-align:left; padding:10px;">
                    <div style="margin-bottom:10px;">배출가스 밀도 = <span style="font-weight:bold;">${data.r}</span> kg/m³</div>
                    <table style="border-collapse:collapse; text-align:center; font-size:0.75rem;">
                        <tr>
                            <td rowspan="3" style="padding-right:10px; font-weight:bold;">r = </td>
                            <td rowspan="3">${data.ro} X </td>
                            <td style="border-bottom:1px solid #000; padding:0 5px;">273</td>
                            <td rowspan="3"> X </td>
                            <td style="border-bottom:1px solid #000; padding:0 5px;">${data.press} + (${data.ps})</td>
                        </tr>
                        <tr>
                            <td style="padding:0 5px;">273 + ${data.temp}</td>
                            <td style="padding:0 5px;">760</td>
                        </tr>
                    </table>
                </td>
            </tr>
            <tr>
                <td style="text-align:left; padding:5px;">
                    <div style="font-weight:bold;">배출가스유속 (m/s)</div>
                    <div style="font-size:0.7rem; line-height:1.2; text-align:center; border:1px solid #ddd; padding:5px; margin-top:5px;">
                        v = C * √(2gh / r)
                    </div>
                </td>
                <td style="text-align:left; padding:10px;">
                    <div style="margin-bottom:10px;">배출가스유속 = <span style="font-weight:bold;">${data.v}</span> m/s</div>
                    <table style="border-collapse:collapse; text-align:center; font-size:0.75rem;">
                        <tr>
                            <td rowspan="3" style="padding-right:10px; font-weight:bold;">v = </td>
                            <td rowspan="3">0.84 X √</td>
                            <td style="border-bottom:1px solid #000; padding:0 5px;">2 X 9.81 X ${data.h}</td>
                        </tr>
                        <tr>
                            <td style="padding:0 5px;">${data.r}</td>
                        </tr>
                    </table>
                </td>
            </tr>
            <tr>
                <td colspan="2" style="text-align:left; padding:5px;">
                    <div style="font-weight:bold; margin-bottom:10px;">등속흡인계수 계산 (I factor) (%)</div>
                    <div style="font-size:0.7rem; line-height:1.2; text-align:center; border:1px solid #ddd; padding:5px; margin-bottom:10px;">
                        I(%) = Ts * [0.00346 Vic + V'm / (Tm(Pa + ΔH/13.6))] / (P's * t * v * An) * 1.667x10^4
                    </div>
                    <div style="margin-bottom:10px; padding-left:10px;">등속흡인계수 계산 (I factor) = <span style="font-weight:bold;">${data.I}</span> %</div>
                    
                    <table style="border-collapse:collapse; text-align:center; font-size:0.75rem; width:100%;">
                        <tr>
                            <td rowspan="3" style="padding-right:10px; font-weight:bold; width:50px;">I(%) = </td>
                            <td style="border-bottom:1px solid #000; padding:0 5px;">
                                ${(273+data.temp)} [ 0.00346 * ${data.vic} + ${(data.vm/1000).toFixed(4)} / ( ${(273+data.tm)} * (${data.press} + ${data.dh}/13.6) ) ]
                            </td>
                            <td rowspan="3" style="padding-left:10px; width:100px;">X (1.667x10⁴)</td>
                        </tr>
                        <tr>
                            <td style="padding:0 5px;">
                                ${data.press + data.ps} * ${data.time} * ${data.v} * ${(Math.PI * Math.pow(data.nozzle/2, 2)).toFixed(4)}
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
        
        <table class="excel-table" style="font-size:0.65rem; text-align:left;">
            <tr>
                <td style="width:50%; border:none; padding-left:10px;">
                    ma : 흡수수분의 질량 (g)<br>
                    Θm : 가스미터에서의 흡인가스온도 (℃)<br>
                    Pm : 가스미터에서의 가스게이지압 (mmHg)<br>
                    ro : 표준상태로 환산한 습한 배출가스 밀도 (kg/Sm³)<br>
                    Ps : 각 측정점에서 배출가스 정압의 평균치 (mmHg)<br>
                    C : 피토우관계수<br>
                    h : 피토우관에 의한 동압 평균치 (mmH2O)<br>
                    Vs : 건식가스미터에서 읽은 가스시료 채취량 (L)<br>
                    Ts : 배출가스 평균 절대온도 (K : 273 + Θs)<br>
                    V'm : 건식가스미터에서 읽은 가스시료 채취량 (m³)<br>
                    Pa : 측정공 위치의 대기압 (mmHg)<br>
                    P's : 배출가스 압력 (mmHg : 760 + Ps)<br>
                    v : 배출가스 평균유속 (m/s)
                </td>
                <td style="width:50%; border:none; padding-left:10px;">
                    Vm : 흡인한 건조 가스량 (L)<br>
                    Pa : 측정공 위치의 대기압 (mmHg)<br>
                    <br>
                    <br>
                    Θs : 각 측정점에서 배출가스 온도의 평균치 (℃)<br>
                    g : 중력 가속도 (9.81m/s²)<br>
                    r : 굴뚝내의 습한 배출가스 밀도 (kg/m³)<br>
                    Xw : 습배기가스 중의 수증기 부피 백분율 (%)<br>
                    Vic : 임핀저와 실리카겔에 채취된 물의 총량 (mL)<br>
                    Tm : 건식가스미터의 평균 절대온도 (K : 273 + Θm)<br>
                    ΔH : 오리피스 압차 (mmH2O)<br>
                    t : 총시료 채취시간 (min)<br>
                    An : 노즐의 단면적 (cm²)
                </td>
            </tr>
        </table>
    `
};
