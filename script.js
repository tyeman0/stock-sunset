let currentData = null;

async function loadData() {
    try {
        const response = await fetch('data.json');
        currentData = await response.json();
        
        document.querySelector('.subtitle').textContent = `${currentData.lastUpdated} 기준, 대한민국 증시 시가총액 TOP 10 기업 분석`;
        
        renderStocks('kospi-list', currentData.kospi);
        renderStocks('kosdaq-list', currentData.kosdaq);
    } catch (error) {
        console.error('데이터를 불러오는데 실패했습니다:', error);
    }
}

function renderStocks(listId, stocks) {
    const container = document.getElementById(listId);
    container.innerHTML = stocks.map(stock => `
        <div class="stock-item" onclick="showDetail('${stock.name}', '${stock.code}')">
            <div class="rank">${stock.rank}</div>
            <div class="name-info">
                <div class="name">${stock.name}</div>
                <div class="tag">${stock.tag}</div>
            </div>
            <div class="price-info">
                <div class="price">${stock.price}원</div>
                <div class="change ${stock.change.startsWith('+') ? 'up' : stock.change.startsWith('-') ? 'down' : ''}">${stock.change}</div>
            </div>
        </div>
    `).join('');
}

function showDetail(name, code) {
    const modal = document.getElementById('detail-modal');
    const modalContent = document.getElementById('modal-body');
    
    // 현재 데이터에서 해당 주식 찾기
    const stock = [...currentData.kospi, ...currentData.kosdaq].find(s => s.code === code);
    
    modal.style.display = 'flex';
    
    // 실적 분석 테이블 HTML 생성
    const performanceHtml = stock.performance.map(p => `
        <tr>
            <td class="perf-label">${p.label}</td>
            <td class="perf-value">${p.value}</td>
            <td class="perf-change ${p.change.startsWith('+') ? 'up' : 'down'}">${p.change}</td>
        </tr>
    `).join('');

    modalContent.innerHTML = `
        <div class="detail-header">
            <h3>${name} <span>(${code})</span></h3>
            <button class="close-btn" onclick="closeModal()">✕</button>
        </div>
        
        <div class="detail-section">
            <h4>📈 주가 그래프 (일봉)</h4>
            <div class="chart-container">
                <img src="https://ssl.pstatic.net/imgfinance/chart/item/area/day/${code}.png?sid=${Date.now()}" alt="${name} 차트">
            </div>
        </div>

        <div class="detail-section">
            <h4>📊 기업 실적 분석 (연간)</h4>
            <div class="performance-table-wrapper">
                <table class="performance-table">
                    <thead>
                        <tr>
                            <th>항목</th>
                            <th>수치</th>
                            <th>전년 대비</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${performanceHtml}
                    </tbody>
                </table>
            </div>
            <div class="link-footer">
                <a href="https://finance.naver.com/item/main.naver?code=${code}" target="_blank" class="external-link">
                    네이버 금융에서 상세 정보 보기
                </a>
            </div>
        </div>
    `;
}

function closeModal() {
    document.getElementById('detail-modal').style.display = 'none';
}

document.addEventListener('DOMContentLoaded', () => {
    loadData();
    
    window.onclick = function(event) {
        const modal = document.getElementById('detail-modal');
        if (event.target == modal) {
            closeModal();
        }
    }
});
