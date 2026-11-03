# Example challenge for the BGSU CTF club website. It is not from a real CTF.
# The server keeps the user's role in a Base64 cookie and never signs it.
import base64
import json
import os

from flask import Flask, make_response, request

app = Flask(__name__)
FLAG = os.environ.get("FLAG", "bgsu{example_flag_not_real}")
GUEST = {"user": "guest", "role": "guest"}


def read_session():
    raw = request.cookies.get("session")
    if not raw:
        return dict(GUEST)
    try:
        return json.loads(base64.b64decode(raw))
    except ValueError:
        return dict(GUEST)


@app.route("/")
def index():
    session = read_session()
    if session.get("role") == "admin":
        body = f"Welcome back, admin. Here is your flag: {FLAG}\n"
    else:
        body = f"Hello {session.get('user', 'guest')}. Only admins can see the flag.\n"

    resp = make_response(body)
    if "session" not in request.cookies:
        cookie = base64.b64encode(json.dumps(GUEST).encode()).decode()
        resp.set_cookie("session", cookie)
    return resp


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
