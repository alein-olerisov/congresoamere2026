"""Servidor de desarrollo local, sin dependencias externas."""

import argparse
from functools import partial
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]


class LocalHandler(SimpleHTTPRequestHandler):
    # Windows puede no registrar WebP en su tabla de tipos MIME.
    extensions_map = {**SimpleHTTPRequestHandler.extensions_map, ".webp": "image/webp"}

    def end_headers(self):
        # Los cambios aparecen al recargar, sin reutilizar copias en cache.
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def send_head(self):
        url = urlsplit(self.path)
        path = unquote(url.path)
        if path in ("/galeria", "/galeria/"):
            destination = "/galeria.html"
            if url.query:
                destination += f"?{url.query}"
            self.send_response(HTTPStatus.TEMPORARY_REDIRECT)
            self.send_header("Location", destination)
            self.send_header("Content-Length", "0")
            self.end_headers()
            return None
        parts = Path(path).parts
        if any(part.startswith(".") for part in parts):
            self.send_error(404)
            return None
        return super().send_head()

    def list_directory(self, path):
        self.send_error(404)
        return None


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--port", type=int, default=8000)
    args = parser.parse_args()
    handler = partial(LocalHandler, directory=str(ROOT))
    try:
        server = ThreadingHTTPServer(("127.0.0.1", args.port), handler)
    except OSError as error:
        parser.exit(1, f"No se pudo iniciar el servidor: {error}\n")
    print(f"Proyecto: {ROOT}", flush=True)
    base_url = f"http://127.0.0.1:{server.server_port}"
    print(f"Portada: {base_url}/", flush=True)
    print(f"Galería: {base_url}/galeria.html", flush=True)
    print("Para detenerlo: Ctrl+C. Recarga el navegador para ver los cambios.", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
