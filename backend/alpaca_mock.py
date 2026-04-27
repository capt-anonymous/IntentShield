class AlpacaSimulatedClient:
    """
    Mock execution client for Alpaca.
    """
    @staticmethod
    def execute_trade(action: str, ticker: str, amount: float):
        # Simulate network delay or execution logs
        print(f"[ALPACA API] EXECUTING: {action} {ticker} for ${amount}")
        return {"status": "success", "order_id": "alp_12345", "filled_avg_price": 100.0}
