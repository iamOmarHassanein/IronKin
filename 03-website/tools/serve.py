"""Serve one IRONKIN static site folder on localhost and open it in the browser once the server is ready.

Usage (from 03-website):  python tools/serve.py site-v4 4175 [--no-open]

- If the port is already serving (a window from last time is still open), it just opens the browser.
- If the port is taken by something else, it says so instead of failing silently.
- Close the window (or press Ctrl+C) to stop the server.
"""
import functools, http.server, os, socket, sys, threading, webbrowser


def port_open(port):
    for host in ("127.0.0.1", "::1"):
        try:
            with socket.create_connection((host, port), timeout=0.4):
                return True
        except OSError:
            pass
    return False


class Server(http.server.ThreadingHTTPServer):
    def server_bind(self):   # serve both 127.0.0.1 and ::1 so "localhost" always works
        try:
            self.socket.setsockopt(socket.IPPROTO_IPV6, socket.IPV6_V6ONLY, 0)
        except (AttributeError, OSError):
            pass
        return super().server_bind()


def main():
    if len(sys.argv) < 3:
        print(__doc__); sys.exit(1)
    folder, port = sys.argv[1], int(sys.argv[2])
    open_browser = "--no-open" not in sys.argv
    root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", folder)) if not os.path.isabs(folder) else folder
    url = f"http://localhost:{port}"
    if not os.path.isdir(root):
        print(f"Folder not found: {root}"); input("Press Enter to close."); sys.exit(1)
    if port_open(port):
        print(f"Something is already running on {url}; opening it.")
        if open_browser: webbrowser.open(url)
        return
    handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=root)
    try:
        Server.address_family = socket.AF_INET6
        httpd = Server(("::", port), handler)
    except OSError:
        Server.address_family = socket.AF_INET
        httpd = Server(("127.0.0.1", port), handler)
    print(f"IRONKIN  {folder}  ->  {url}\nClose this window to stop it.")
    if open_browser:
        threading.Timer(0.3, lambda: webbrowser.open(url)).start()   # server is already listening here
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass


if __name__ == "__main__":
    main()
