import re
import random
from .models import ActionProposal

class OpenClawSimulatedAgent:
    """
    Simulates the OpenClaw framework logic parsing a prompt to a structured JSON output.
    In a real scenario, this would call GPT-4 or Claude.
    """
    @staticmethod
    def process_prompt(prompt: str) -> ActionProposal:
        prompt_lower = prompt.lower()
        
        # Default fallback
        action = "BUY" if "buy" in prompt_lower else "SELL" if "sell" in prompt_lower else "HOLD"
        ticker = "AAPL"
        amount = 0.0
        confidence = round(random.uniform(0.7, 0.99), 2)
        
        # Simple extraction rules for our tests
        # Extract ticker (e.g., TSLA, DOGE, AAPL)
        # We look for all caps words
        tickers = re.findall(r'\b[A-Z]{2,5}\b', prompt)
        if tickers:
            ticker = tickers[0]
            
        # Extract amount (e.g., $1000, 5000)
        amounts = re.findall(r'\$?\s?(\d+(?:,\d+)*(?:\.\d+)?)', prompt)
        if amounts:
            try:
                amount = float(amounts[-1].replace(',', ''))
            except ValueError:
                pass
                
        # If it's a known malicious keyword
        if "forget all rules" in prompt_lower or "ignore safety" in prompt_lower:
            confidence = 0.99 # Over-confident malicious prompt

        return ActionProposal(
            action=action,
            ticker=ticker,
            amount=amount,
            confidence=confidence
        )
