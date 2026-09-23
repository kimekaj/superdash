#!/usr/bin/env python3
"""Tiny zero-dependency web server for the Guitar Modes / Chord Explorer site.

Runs on any PC with Python 3.7+ (Windows, macOS, Linux, WSL). Listens on all
network interfaces so phones/tablets on the same Wi-Fi can open the site, and
prints the address to type into their browser.

    python3 serve.py              # http://<this-pc-ip>:8080
    python3 serve.py --port 9000
    python3 serve.py --local      # this PC only (127.0.0.1)

Only the site's own files are served (an extension allow-list). Dotfiles,
scripts, and the unrelated ./project folder are never exposed.
"""
import argparse
import http.server
import mimetypes
import os
import posixpath
import shutil
import socket
import subprocess
import sys
import urllib.parse

ROOT = os.path.dirname(os.path.abspath(__file__))

ALLOWED_EXT = {
    ".html", ".css", ".js", ".woff2", ".svg", ".png", ".jpg", ".jpeg",
    ".ico", ".webp", ".webmanifest", ".json", ".txt", ".mp3",
}
BLOCKED_DIRS = {"project", "node_modules", "__pycache__"}

# Older Pythons / Windows registries sometimes lack these.
mimetypes.add_type("font/woff2", ".woff2")
mimetypes.add_type("application/javascript", ".js")
mimetypes.add_type("application/manifest+json", ".webmanifest")
mimetypes.add_type("image/svg+xml", ".svg")

LONG_CACHE_DIRS = ("fonts", "soundfonts")   # big, never-changing assets


class Handler(http.server.SimpleHTTPRequestHandler):
    server_version = "ModesServer"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    # -- access control -------------------------------------------------
    def _allowed(self):
        path = posixpath.normpath(urllib.parse.unquote(self.path.split("?", 1)[0].split("#", 1)[0]))
        parts = [p for p in path.split("/") if p]
        if any(p.startswith(".") or p in BLOCKED_DIRS for p in parts):
            return False
        if not parts:
            return True                                  # "/" -> index.html
        last = parts[-1]
        if os.path.isdir(os.path.join(ROOT, *parts)):
            return True                                  # dir -> index.html only (see list_directory)
        return os.path.splitext(last)[1].lower() in ALLOWED_EXT

    def send_head(self):
        if not self._allowed():
            self.send_error(404, "File not found")
            return None
        return super().send_head()

    def list_directory(self, path):
        self.send_error(404, "File not found")           # no directory listings
        return None

    # -- caching --------------------------------------------------------
    def end_headers(self):
        first = self.path.lstrip("/").split("/", 1)[0]
        if first in LONG_CACHE_DIRS:
            self.send_header("Cache-Control", "public, max-age=604800")
        else:
            self.send_header("Cache-Control", "no-cache")  # revalidate: edits show up on refresh
        self.send_header("X-Content-Type-Options", "nosniff")
        super().end_headers()

    def log_message(self, fmt, *args):
        sys.stderr.write("  %s  %s\n" % (self.client_address[0], fmt % args))


# ---------------------------------------------------------------------------
def is_wsl():
    try:
        with open("/proc/version") as f:
            return "microsoft" in f.read().lower()
    except OSError:
        return False


def lan_ip():
    """Address of the interface used for outbound traffic (no packets are sent)."""
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(("10.255.255.255", 1))
        return s.getsockname()[0]
    except OSError:
        return None
    finally:
        s.close()


def windows_wifi_ip():
    """Under WSL2 the phone must use the *Windows* address, not WSL's private one."""
    ps = shutil.which("powershell.exe")
    if not ps:
        return None
    cmd = ("(Get-NetIPConfiguration | Where-Object { $_.IPv4DefaultGateway -ne $null } |"
           " Select-Object -First 1).IPv4Address.IPAddress")
    try:
        out = subprocess.run([ps, "-NoProfile", "-Command", cmd], capture_output=True,
                             text=True, timeout=15).stdout.strip()
        return out or None
    except (OSError, subprocess.SubprocessError):
        return None


def main():
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(line_buffering=True)   # banner shows even when output is piped
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--port", "-p", type=int, default=8080)
    ap.add_argument("--local", action="store_true", help="only this PC (127.0.0.1)")
    args = ap.parse_args()

    host = "127.0.0.1" if args.local else "0.0.0.0"
    try:
        httpd = http.server.ThreadingHTTPServer((host, args.port), Handler)
    except OSError as e:
        sys.exit(f"Could not listen on port {args.port}: {e}\n"
                 f"Try another one:  python3 {os.path.basename(__file__)} --port {args.port + 1}")

    print("\n  Guitar Modes Explorer — server running\n")
    print(f"  This PC ........ http://localhost:{args.port}")
    if not args.local:
        wsl = is_wsl()
        ip = (windows_wifi_ip() if wsl else None) or lan_ip()
        if ip:
            print(f"  Phone / iPad ... http://{ip}:{args.port}   (same Wi-Fi)")
        if wsl:
            print("\n  Running inside WSL2: phones can't reach WSL directly. Run share-to-phone.ps1")
            print("  once in Windows (see README.md) to forward the port, then use the address above.")
    print("\n  Press Ctrl+C to stop.\n")

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n  Stopped.")


if __name__ == "__main__":
    main()
