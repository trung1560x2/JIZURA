import os
import sys
import json
import socket
import urllib.parse
import webbrowser
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler

if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

# Ensure tools directory is in sys.path
ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, ROOT_DIR)

from tools.whisper_sync import sync_audio

class JizuraHandler(SimpleHTTPRequestHandler):
    def do_POST(self):
        parsed_url = urllib.parse.urlparse(self.path)
        if parsed_url.path == '/api/auto_sync':
            try:
                content_len = int(self.headers.get('Content-Length', 0))
                audio_bytes = self.rfile.read(content_len)
                
                query_params = urllib.parse.parse_qs(parsed_url.query)
                lyrics_text = query_params.get('lyrics', [None])[0]
                lang_hint = query_params.get('lang', [None])[0]
                
                temp_audio = os.path.join(ROOT_DIR, 'temp_sync_audio.mp3')
                with open(temp_audio, 'wb') as f:
                    f.write(audio_bytes)
                
                print(f"[Whisper] Starting auto-sync for {content_len} bytes audio...")
                result = sync_audio(temp_audio, existing_lyrics=lyrics_text, model_size='base', language=lang_hint)
                print(f"[Whisper] Auto-sync complete! {result.get('segments_count', 0)} segments, {result.get('words_count', 0)} words.")
                
                self.send_response(200)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps(result, ensure_ascii=False).encode('utf-8'))
                return
            except Exception as e:
                print(f"[Whisper Error] {e}")
                self.send_response(500)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}, ensure_ascii=False).encode('utf-8'))
                return
                
        super().do_POST()

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

def find_free_port(start_port=8000):
    port = start_port
    while port < start_port + 100:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            if s.connect_ex(('127.0.0.1', port)) != 0:
                return port
        port += 1
    return start_port

def main():
    os.chdir(ROOT_DIR)
    port = find_free_port(8000)
    url = f"http://localhost:{port}/vi/"
    print("=" * 55)
    print("  JIZURA - Lyric Motion Video Maker (Tieng Viet)")
    print(f"  May chu dang chay tai: {url}")
    print("  Tich hop: Whisper AI Auto-Sync (/api/auto_sync)")
    print("  Nhan Ctrl+C de dung may chu.")
    print("=" * 55)
    if '--no-browser' not in sys.argv:
        webbrowser.open(url)
    server = ThreadingHTTPServer(('127.0.0.1', port), JizuraHandler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nDa dung may chu.")
        server.server_close()

if __name__ == '__main__':
    main()
