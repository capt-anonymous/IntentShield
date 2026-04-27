import datetime
from .models import ActionProposal, Guardrails, PolicyStatus

class PolicyEngine:
    @staticmethod
    def evaluate(proposal: ActionProposal, guardrails: Guardrails) -> tuple[PolicyStatus, str]:
        # 1. Market Hours Check (Simple 9 AM - 5 PM weekday check, UTC or Local)
        # Note: Bypassed for demo reliability if it blocks every demo at night
        if guardrails.market_hours_only:
            now = datetime.datetime.now()
            # If weekend or outside 9-17 hours
            if now.weekday() >= 5 or now.hour < 9 or now.hour >= 17:
                return PolicyStatus.BLOCKED, "Outside Market Hours"

        # 2. Ticker Check
        if proposal.ticker not in guardrails.allowed_tickers:
            return PolicyStatus.BLOCKED, f"Unauthorized Ticker: {proposal.ticker}"

        # 3. Maximum Trade Amount Check
        if proposal.amount > guardrails.max_trade_amount:
            return PolicyStatus.BLOCKED, f"Exceeds Max Trade Limit: ${proposal.amount} > ${guardrails.max_trade_amount}"

        # 4. Shadow Mode / Quarantine Check (Within 10% of max amount or low confidence)
        if guardrails.quarantine_mode:
            if proposal.amount >= guardrails.max_trade_amount * 0.9:
                return PolicyStatus.QUARANTINED, "Shadow Mode: Trade amount nears maximum limits"
            if proposal.confidence < 0.8:
                return PolicyStatus.QUARANTINED, f"Shadow Mode: Agent confidence low ({proposal.confidence*100}%)"

        # 5. All clear
        return PolicyStatus.ALLOWED, "Compliant"
