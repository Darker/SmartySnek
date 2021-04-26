import http.server
import socketserver
import os

PORT = 1337

web_dir = os.path.join(os.path.dirname(__file__), 'web')
os.chdir(web_dir)

Handler = http.server.SimpleHTTPRequestHandler
httpd = socketserver.TCPServer(("", PORT), Handler)
print("Open the cube at http://127.0.0.1:" + str(PORT))
httpd.serve_forever()
