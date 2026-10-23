#!/usr/bin/env python3
"""A no-dependency, loopback-only static server for the local reading room."""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import argparse
import os
import webbrowser

parser = argparse.ArgumentParser(description='启动观易本地学习书房')
parser.add_argument('--port', type=int, default=8765)
parser.add_argument('--open', action='store_true')
args = parser.parse_args()
os.chdir(Path(__file__).resolve().parent)

class Handler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache')
        super().end_headers()

try:
    server = ThreadingHTTPServer(('127.0.0.1', args.port), Handler)
except OSError:
    print(f'端口 {args.port} 无法使用。可运行 python3 server.py --port 8766 --open 更换端口。', flush=True)
    raise SystemExit(1)
url = f'http://127.0.0.1:{args.port}'
print(f'观易学习书房已启动：{url}', flush=True)
print('关闭此窗口或按 Ctrl+C 停止服务。', flush=True)
if args.open:
    webbrowser.open(url)
try:
    server.serve_forever()
except KeyboardInterrupt:
    server.server_close()
