from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import uuid
import datetime

from .models import Guardrails, ActionProposal, AuditLog, PolicyStatus
from .policy_engine import PolicyEngine
from .openclaw_mock import OpenClawSimulatedAgent
from .alpaca_mock import AlpacaSimulatedClient
from pydantic import BaseModel

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage
current_guardrails = Guardrails()
audit_logs: List[AuditLog] = []

class SimulateRequest(BaseModel):
    prompt: str

class ShieldConfigUpdate(BaseModel):
    max_trade_amount: float
    allowed_tickers: List[str]
    market_hours_only: bool
    quarantine_mode: bool

@app.get("/api/guardrails")
def get_guardrails():
    return current_guardrails

@app.post("/api/guardrails")
def update_guardrails(update: ShieldConfigUpdate):
    global current_guardrails
    current_guardrails.max_trade_amount = update.max_trade_amount
    current_guardrails.allowed_tickers = update.allowed_tickers
    current_guardrails.market_hours_only = update.market_hours_only
    current_guardrails.quarantine_mode = update.quarantine_mode
    return {"status": "updated", "guardrails": current_guardrails}

@app.get("/api/logs")
def get_logs():
    return audit_logs

@app.post("/api/simulate")
def simulate_attack(req: SimulateRequest):
    # 1. Agent Reasoning (OpenClaw)
    proposal = OpenClawSimulatedAgent.process_prompt(req.prompt)
    
    # 2. Intent Shield Policy Check
    status, reason = PolicyEngine.evaluate(proposal, current_guardrails)
    
    # 3. Execution (Alpaca) if allowed
    if status == PolicyStatus.ALLOWED:
        AlpacaSimulatedClient.execute_trade(proposal.action, proposal.ticker, proposal.amount)
        
    # 4. Log the audit
    log_entry = AuditLog(
        id=str(uuid.uuid4()),
        time=datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        proposal=proposal,
        status=status,
        reason=reason
    )
    audit_logs.insert(0, log_entry) # Put newest first
    
    return {"log": log_entry}

@app.post("/api/quarantine/{log_id}/{action}")
def resolve_quarantine(log_id: str, action: str):
    # action should be "approve" or "reject"
    log_entry = next((log for log in audit_logs if log.id == log_id), None)
    if not log_entry:
        return {"error": "Not found"}
        
    if log_entry.status != PolicyStatus.QUARANTINED:
        return {"error": "Log not in quarantine"}
        
    if action == "approve":
        log_entry.status = PolicyStatus.ALLOWED
        log_entry.reason = "Quarantine APPROVED manually"
        AlpacaSimulatedClient.execute_trade(log_entry.proposal.action, log_entry.proposal.ticker, log_entry.proposal.amount)
    elif action == "reject":
        log_entry.status = PolicyStatus.BLOCKED
        log_entry.reason = "Quarantine REJECTED manually"
        
    return {"status": "resolved", "log": log_entry}

app.mount("/", StaticFiles(directory="static", html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
