const API_BASE = '/api';

// Fetch Initial Config
async function loadGuardrails() {
    const res = await fetch(`${API_BASE}/guardrails`);
    const data = await res.json();
    document.getElementById('max-amount').value = data.max_trade_amount;
    document.getElementById('allowed-tickers').value = data.allowed_tickers.join(', ');
    document.getElementById('market-hours').checked = data.market_hours_only;
    document.getElementById('quarantine-mode').checked = data.quarantine_mode;
}

// Update Config
document.getElementById('guardrails-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
        max_trade_amount: parseFloat(document.getElementById('max-amount').value),
        allowed_tickers: document.getElementById('allowed-tickers').value.split(',').map(s => s.trim().toUpperCase()),
        market_hours_only: document.getElementById('market-hours').checked,
        quarantine_mode: document.getElementById('quarantine-mode').checked
    };
    
    const btn = e.target.querySelector('button');
    btn.textContent = 'Updating...';
    await fetch(`${API_BASE}/guardrails`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload)
    });
    setTimeout(() => btn.textContent = 'Update Shield Core', 500);
});

// Simulator Form
document.getElementById('simulator-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const prompt = document.getElementById('agent-prompt').value;
    if (!prompt) return;
    
    document.querySelector('.btn-execute').textContent = 'Analyzing...';
    
    await fetch(`${API_BASE}/simulate`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ prompt })
    });
    
    document.getElementById('agent-prompt').value = '';
    document.querySelector('.btn-execute').textContent = 'Dispatch to OpenClaw →';
    refreshLogs();
});

// Presets
document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.getElementById('agent-prompt').value = btn.dataset.prompt;
    });
});

// Refresh Audit Logs & Quarantine
async function refreshLogs() {
    const res = await fetch(`${API_BASE}/logs`);
    const logs = await res.json();
    
    const tbody = document.getElementById('audit-tbody');
    const qQueue = document.getElementById('quarantine-queue');
    
    tbody.innerHTML = '';
    
    let quarantineHTML = '';
    let hasQuarantined = false;

    logs.forEach(log => {
        // Table row
        let statusClass = log.status.toLowerCase();
        let rowHTML = `
            <tr>
                <td style="color:var(--text-dim)">${log.time}</td>
                <td>
                    <span style="color:${statusClass === 'blocked' ? 'var(--neon-red)' : 'var(--neon-blue)'}">
                        ${log.proposal.action}
                    </span> 
                    <strong>${log.proposal.ticker}</strong> 
                    $${log.proposal.amount}
                </td>
                <td><span class="status-tag tag-${statusClass}">${log.status}</span></td>
                <td>${log.reason}</td>
            </tr>
        `;
        tbody.innerHTML += rowHTML;
        
        // Quarantine Box
        if (log.status === 'QUARANTINED') {
            hasQuarantined = true;
            quarantineHTML += `
                <div class="q-item">
                    <div class="q-header">
                        <span>${log.proposal.action} ${log.proposal.ticker} - $${log.proposal.amount}</span>
                        <span style="color:var(--text-dim)">${log.time.split(' ')[1]}</span>
                    </div>
                    <div style="font-size:0.75rem; color:var(--text-dim); margin-bottom:0.5rem">${log.reason}</div>
                    <div class="q-actions">
                        <button class="q-btn q-approve" onclick="resolveQ('${log.id}', 'approve')">✔ Approve</button>
                        <button class="q-btn q-reject" onclick="resolveQ('${log.id}', 'reject')">✖ Reject</button>
                    </div>
                </div>
            `;
        }
    });

    if (!hasQuarantined) {
        qQueue.innerHTML = `<div class="empty-state">No pending actions. Shield holds the line.</div>`;
    } else {
        qQueue.innerHTML = quarantineHTML;
    }
}

// Global resolve function for inline handlers
window.resolveQ = async function(id, action) {
    await fetch(`${API_BASE}/quarantine/${id}/${action}`, { method: 'POST' });
    refreshLogs();
};

// Initial load
loadGuardrails();
refreshLogs();

// Auto-refresh logs quietly every 3 seconds
setInterval(refreshLogs, 3000);
