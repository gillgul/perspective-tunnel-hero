"""Serve the standalone Perspective Tunnel Hero page locally and open it in a browser.

Usage:
    python serve.py          # http://127.0.0.1:8000
    python serve.py 9000     # pick another port
"""
import functools
import http.server
import pathlib
import socketserver
import sys
import webbrowser

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
ROOT = pathlib.Path(__file__).resolve().parent
PAGE = "index.html"


def main() -> None:
    handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=str(ROOT))
    with socketserver.TCPServer(("127.0.0.1", PORT), handler) as httpd:
        url = f"http://127.0.0.1:{PORT}/{PAGE}"
        print(f"Serving {url}  (press Ctrl+C to stop)")
        webbrowser.open(url)
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nStopped.")


if __name__ == "__main__":
    main()
