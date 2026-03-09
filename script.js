const socket = io();
const distanceEl = document.getElementById('distance-value');
const alertBar = document.getElementById('alert-bar');
const alertText = document.getElementById('alert-text');
const wifiStatus = document.getElementById('wifi-status');
const hapticStatus = document.getElementById('haptic-status');
const buzzerStatus = document.getElementById('buzzer-status');
const statusBadge = document.getElementById('status-badge');

// Neon Chart Config
const ctx = document.getElementById('distanceChart').getContext('2d');
const gradient = ctx.createLinearGradient(0, 0, 0, 400);
gradient.addColorStop(0, 'rgba(14, 165, 233, 0.4)');
gradient.addColorStop(1, 'rgba(14, 165, 233, 0)');

const chart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: Array(20).fill(''),
        datasets: [{
            label: 'DISTANCE',
            data: Array(20).fill(0),
            borderColor: '#0ea5e9',
            borderWidth: 3,
            pointRadius: 0,
            tension: 0.4,
            fill: true,
            backgroundColor: gradient
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true,
                max: 200,
                grid: { color: 'rgba(255,255,255,0.05)' },
                ticks: { color: '#64748b' }
            },
            x: { display: false }
        },
        plugins: {
            legend: { display: false }
        },
        animation: { duration: 0 }
    }
});

socket.on('connect', () => {
    statusBadge.textContent = 'LINK ACTIVE';
    statusBadge.className = 'badge online';
    statusBadge.style.backgroundColor = 'rgba(16, 185, 129, 0.1)';
    statusBadge.style.color = '#10b981';
});

socket.on('sensorData', (data) => {
    const dist = parseInt(data.distance);
    
    // Formatting for "tech" look (00 padding)
    distanceEl.textContent = dist < 10 ? `0${dist}` : dist;
    
    // Update chart
    chart.data.datasets[0].data.push(dist);
    chart.data.datasets[0].data.shift();
    chart.update();

    let statusClass = 'safe'; 
    let text = 'PATH CLEAR // NO OBSTRUCTION'; 
    let barWidth = '30%';
    let glowColor = 'rgba(16, 185, 129, 0.5)';

    if (dist < 10) {
        statusClass = 'danger'; 
        text = 'CRITICAL ALERT // STOP IMMEDIATELY'; 
        barWidth = '100%';
        glowColor = 'rgba(239, 68, 68, 0.5)';
    } else if (dist < 20) {
        statusClass = 'caution'; 
        text = 'WARNING // OBSTACLE DETECTED'; 
        barWidth = '65%';
        glowColor = 'rgba(245, 158, 11, 0.5)';
    }

    alertText.textContent = text;
    alertText.style.color = `var(--${statusClass})`;
    
    let barInner = alertBar.querySelector('.bar-inner') || document.createElement('div');
    if (!barInner.className) { barInner.className = 'bar-inner'; alertBar.appendChild(barInner); }
    barInner.style.width = barWidth; 
    barInner.style.backgroundColor = `var(--${statusClass})`;
    barInner.style.boxShadow = `0 0 15px ${glowColor}`;

    distanceEl.style.color = `var(--${statusClass})`;
    distanceEl.style.textShadow = `0 0 20px ${glowColor}`;

    wifiStatus.textContent = `${data.wifi}dB`;
    hapticStatus.textContent = data.vibration ? 'ENGAGED' : 'IDLE';
    buzzerStatus.textContent = data.buzzer ? 'ENGAGED' : 'IDLE';
    
    hapticStatus.style.color = data.vibration ? 'var(--accent)' : 'inherit';
    buzzerStatus.style.color = data.buzzer ? 'var(--danger)' : 'inherit';
});
