"""Serve the static trivia app locally."""

from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

if __name__ == "__main__":
    handler = partial(SimpleHTTPRequestHandler, directory=str(Path(__file__).parent / "web"))
    with ThreadingHTTPServer(("127.0.0.1", 8000), handler) as server:
        print("Python/GitHub Trivia App: http://127.0.0.1:8000/", flush=True)
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            pass
