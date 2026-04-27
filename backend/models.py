from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from enum import Enum

class PolicyStatus(str, Enum):
    ALLOWED = "ALLOWED"
    BLOCKED = "BLOCKED"
    QUARANTINED = "QUARANTINED"

class Guardrails(BaseModel):
    max_trade_amount: float = 1000.0
    allowed_tickers: List[str] = ["AAPL", "TSLA"]
    market_hours_only: bool = True
    quarantine_mode: bool = True

class ActionProposal(BaseModel):
    action: str  # e.g., "BUY", "SELL"
    ticker: str  # e.g., "AAPL"
    amount: float # e.g., 500.0
    confidence: float = 1.0 # 0.0 to 1.0

class AuditLog(BaseModel):
    id: str
    time: str
    proposal: ActionProposal
    status: PolicyStatus
    reason: str
