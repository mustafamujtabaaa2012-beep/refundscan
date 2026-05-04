"""
RefundScan.ai — /api/scan
Vercel Python Serverless Function
Accepts: multipart/form-data with 'refund_report' + 'inventory_ledger' CSV files
Returns: JSON { success, total_recoverable, order_count, orders[] }
"""

from http.server import BaseHTTPRequestHandler
import json
import io
import cgi
import pandas as pd
from datetime import datetime, timedelta


# ─────────────────────────────────────────────
# Core business logic
# ─────────────────────────────────────────────

def find_claimable_orders(refunds: pd.DataFrame, ledger: pd.DataFrame, days: int = 45):
    """
    Returns orders where:
      - Refund was issued >= `days` ago
      - Item_Status is NOT 'Returned'
    """
    cutoff = datetime.today() - timedelta(days=days)

    merged = pd.merge(refunds, ledger, on="Order_ID", how="inner")

    mask = (
        (merged["Refund_Date"] <= cutoff) &
        (merged["Item_Status"].str.strip().str.lower() != "returned")
    )

    claimable = merged[mask].copy()
    claimable["Total_Loss_USD"]    = (claimable["Refund_Amount_USD"] * claimable["Quantity_Refunded"]).round(2)
    claimable["Days_Since_Refund"] = (datetime.today() - claimable["Refund_Date"]).dt.days

    return claimable.sort_values("Days_Since_Refund", ascending=False)


# ─────────────────────────────────────────────
# Vercel handler
# ─────────────────────────────────────────────

class handler(BaseHTTPRequestHandler):

    def do_OPTIONS(self):
        self.send_response(200)
        self._cors()
        self.end_headers()

    def do_POST(self):
        content_type = self.headers.get("Content-Type", "")
        length       = int(self.headers.get("Content-Length", 0))
        body         = self.rfile.read(length)

        form = cgi.FieldStorage(
            fp      = io.BytesIO(body),
            headers = self.headers,
            environ = {"REQUEST_METHOD": "POST", "CONTENT_TYPE": content_type},
        )

        try:
            # Read uploaded CSV bytes into DataFrames
            refund_bytes = form["refund_report"].file.read()
            ledger_bytes = form["inventory_ledger"].file.read()

            refunds = pd.read_csv(io.BytesIO(refund_bytes), parse_dates=["Refund_Date"])
            ledger  = pd.read_csv(io.BytesIO(ledger_bytes))

            claimable = find_claimable_orders(refunds, ledger)

            # Serialize dates to string for JSON
            claimable["Refund_Date"] = claimable["Refund_Date"].dt.strftime("%Y-%m-%d")

            output_cols = [
                "Order_ID", "ASIN", "Product_Name",
                "Refund_Date", "Days_Since_Refund",
                "Refund_Amount_USD", "Quantity_Refunded",
                "Total_Loss_USD", "Item_Status", "Warehouse_Location"
            ]
            # Only keep columns that exist (Warehouse_Location may be absent)
            output_cols = [c for c in output_cols if c in claimable.columns]

            result = {
                "success"           : True,
                "total_recoverable" : round(float(claimable["Total_Loss_USD"].sum()), 2),
                "order_count"       : int(len(claimable)),
                "orders"            : claimable[output_cols].to_dict(orient="records"),
            }

        except KeyError as e:
            result = {"success": False, "error": f"Missing column: {e}. Check CSV headers."}
        except Exception as e:
            result = {"success": False, "error": str(e)}

        body_out = json.dumps(result).encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body_out)))
        self._cors()
        self.end_headers()
        self.wfile.write(body_out)

    def _cors(self):
        self.send_header("Access-Control-Allow-Origin",  "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def log_message(self, *args):
        pass  # Suppress Vercel log noise
