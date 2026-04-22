import fs from 'fs';

async function fetchStockRanking(sosok) {
    // sosok=0 (KOSPI), sosok=1 (KOSDAQ)
    const url = `https://m.stock.naver.com/api/json/sise/siseListJson.nhn?menu=market_sum&sosok=${sosok}&pageSize=10`;
    const response = await fetch(url);
    const data = await response.json();
    return data.result.itemList;
}

const tagMap = {
    "005930": "반도체/IT",
    "000660": "반도체/메모리",
    "005935": "우선주/반도체",
    "373220": "2차전지/배터리",
    "005380": "자동차/모빌리티",
    "402340": "지주사/투자",
    "034020": "에너지/원자력",
    "012450": "방산/항공우주",
    "207940": "바이오/의약품",
    "329180": "조선/기계",
    "086520": "2차전지/소재",
    "247540": "2차전지/부품",
    "196170": "바이오/플랫폼",
    "277810": "로봇/AI",
    "000250": "제약/바이오",
    "058470": "반도체/검사",
    "950160": "바이오/신약",
    "298380": "바이오/면역",
    "028300": "제약/바이오",
    "141080": "바이오/항암제"
};

async function updateData() {
    console.log('실시간 데이터 및 실적 정보를 업데이트 중...');
    
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    
    try {
        const kospiRaw = await fetchStockRanking(0);
        const kosdaqRaw = await fetchStockRanking(1);

        // 실적 분석 샘플 (실제 기업별 실적 API가 없으므로 정교한 가상 데이터를 생성하거나 기본값 사용)
        const getPerformance = (name) => [
            { label: "매출액", value: "최신 집계 중", change: "N/A" },
            { label: "영업이익", value: "최신 집계 중", change: "N/A" },
            { label: "당기순이익", value: "최신 집계 중", change: "N/A" },
            { label: "영업이익률", value: "N/A", change: "N/A" },
            { label: "ROE", value: "N/A", change: "N/A" },
            { label: "부채비율", value: "N/A", change: "N/A" }
        ];

        const kospi = kospiRaw.map((item, index) => ({
            rank: index + 1,
            name: item.nm,
            code: item.cd,
            price: item.nv.toLocaleString(),
            change: item.cr > 0 ? `+${item.cr}%` : `${item.cr}%`,
            tag: tagMap[item.cd] || "기타",
            performance: getPerformance(item.nm)
        }));

        const kosdaq = kosdaqRaw.map((item, index) => ({
            rank: index + 1,
            name: item.nm,
            code: item.cd,
            price: item.nv.toLocaleString(),
            change: item.cr > 0 ? `+${item.cr}%` : `${item.cr}%`,
            tag: tagMap[item.cd] || "기타",
            performance: getPerformance(item.nm)
        }));

        const data = {
            lastUpdated: formattedDate,
            kospi,
            kosdaq
        };
        
        fs.writeFileSync('./data.json', JSON.stringify(data, null, 2));
        console.log(`데이터 업데이트 완료: ${formattedDate}`);
        
    } catch (error) {
        console.error('데이터를 가져오는 중 오류 발생:', error);
        throw error;
    }
}

updateData().catch(err => {
    console.error('업데이트 도중 에러 발생:', err);
    process.exit(1);
});
