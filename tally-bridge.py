#!/usr/bin/env python3
"""
Papneja Associates TaxOne - Local Tally Prime Connector Bridge
Run this script locally on the computer where Tally Prime is running.
Usage:
    python3 tally-bridge.py
"""

import http.server
import socketserver
import urllib.request
import urllib.error
import json
import sys

TALLY_URL = "http://127.0.0.1:9000"
BRIDGE_PORT = 9001

class TallyBridgeHandler(http.server.BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        # Enable CORS for browser requests
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_GET(self):
        # Health check & Tally status ping
        is_tally_online = self.check_tally()
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()

        response = {
            "bridge": "Papneja TaxOne Bridge",
            "version": "2.4.0",
            "tally_url": TALLY_URL,
            "tally_online": is_tally_online,
            "message": "Tally Prime is connected" if is_tally_online else "Tally Prime not detected on port 9000"
        }
        self.wfile.write(json.dumps(response).encode("utf-8"))

    def do_POST(self):
        # Relay XML envelope to local Tally Prime
        content_length = int(self.headers.get("Content-Length", 0))
        post_data = self.rfile.read(content_length)

        try:
            req = urllib.request.Request(
                TALLY_URL,
                data=post_data,
                headers={"Content-Type": "text/xml;charset=utf-8"}
            )
            with urllib.request.urlopen(req, timeout=10) as resp:
                tally_reply = resp.read()
                self.send_response(200)
                self.send_header("Content-Type", "text/xml;charset=utf-8")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(tally_reply)
        except Exception as e:
            self.send_response(502)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            err_resp = {
                "error": "Failed to communicate with Tally Prime",
                "details": str(e),
                "hint": "Check if Tally Prime is running and XML Server is enabled on port 9000 (F1 -> Settings -> Connectivity -> Both)"
            }
            self.wfile.write(json.dumps(err_resp).encode("utf-8"))

    def check_tally(self):
        ping_xml = """<ENVELOPE><HEADER><TALLYREQUEST>Export Data</TALLYREQUEST></HEADER><BODY><EXPORTDATA><REQUESTDESC><STATICVARIABLES><SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT></STATICVARIABLES><REPORTNAME>List of Companies</REPORTNAME></REQUESTDESC></EXPORTDATA></BODY></ENVELOPE>"""
        try:
            req = urllib.request.Request(
                TALLY_URL,
                data=ping_xml.encode("utf-8"),
                headers={"Content-Type": "text/xml"}
            )
            with urllib.request.urlopen(req, timeout=2) as resp:
                return resp.status == 200
        except Exception:
            return False

def run_bridge():
    print("=" * 60)
    print("🚀 Papneja Associates TaxOne - Tally Prime Local Bridge")
    print(f"📡 Bridge listening on: http://localhost:{BRIDGE_PORT}")
    print(f"🔌 Target Tally Socket: {TALLY_URL}")
    print("=" * 60)
    print("Ready to receive and push batch invoices into Tally Prime.")
    print("Press Ctrl+C to stop.")

    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", BRIDGE_PORT), TallyBridgeHandler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nBridge stopped.")

if __name__ == "__main__":
    run_bridge()
