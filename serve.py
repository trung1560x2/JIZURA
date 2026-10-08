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
                content_type = self.headers.get('Content-Type', '')
                raw_body = self.rfile.read(content_len)

                audio_bytes = None
                lyrics_text = None
                lang_hint = 'vi'

                if 'multipart/form-data' in content_type:
                    import email
                    msg = email.message_from_bytes(b'Content-Type: ' + content_type.encode() + b'\r\n\r\n' + raw_body)
                    for part in msg.walk():
                        fn = part.get_filename()
                        pname = part.get_param('name', header='content-disposition')
                        if pname == 'audio' or fn:
                            audio_bytes = part.get_payload(decode=True)
                        elif pname == 'lyrics':
                            lyrics_text = part.get_payload(decode=True).decode('utf-8', errors='replace')
                        elif pname == 'lang':
                            lang_hint = part.get_payload(decode=True).decode('utf-8', errors='replace')
                else:
                    audio_bytes = raw_body
                    query_params = urllib.parse.parse_qs(parsed_url.query)
                    lyrics_text = query_params.get('lyrics', [None])[0]
                    lang_hint = query_params.get('lang', ['vi'])[0]

                if not audio_bytes:
                    raise ValueError("No audio data received.")

                temp_audio = os.path.join(ROOT_DIR, 'temp_sync_audio.mp3')
                with open(temp_audio, 'wb') as f:
                    f.write(audio_bytes)

                if lyrics_text and len(lyrics_text.strip()) > 10:
                    print(f"[Auto-Sync] Using High-Precision Forced Alignment (Stable-Whisper)...")
                    from tools.forced_alignment import align_audio_to_lyrics
                    result = align_audio_to_lyrics(temp_audio, lyrics_text, language=lang_hint or 'vi')
                    print(f"[Auto-Sync] Forced Alignment complete! {result.get('lines_count', 0)} lines in {result.get('alignment_time', 0):.2f}s.")
                else:
                    print(f"[Whisper] Starting auto-sync transcription for {len(audio_bytes)} bytes audio...")
                    from tools.whisper_sync import sync_audio
                    result = sync_audio(temp_audio, existing_lyrics=lyrics_text, model_size='base', language=lang_hint)
                    print(f"[Whisper] Auto-sync complete! {result.get('segments_count', 0)} segments.")
                
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
