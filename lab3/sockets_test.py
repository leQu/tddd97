import time
from geventwebsocket.handler import WebSocketHandler
from gevent.pywsgi import WSGIServer
from werkzeug.serving import run_with_reloader
from geventwebsocket.handler import WebSocketHandler
from flask import Flask, request, session, g, redirect, url_for, \
    abort, render_template, flash, jsonify
from flask import request, render_template
from geventwebsocket.handler import WebSocketHandler
import json


current_sockets = []


app = Flask(__name__)


@app.route('/')
def index():
    return redirect('static/temp.html')


@app.route('/socket-connect')
def socket_connect():
    if request.environ.get("wsgi.websocket"):
        ws = request.environ["wsgi.websocket"]

        current_sockets.append(ws)

        while True:
            data = ws.receive()
            for socket in current_sockets:
                socket.send(str(data))



'''
@app.route("/realtime_messages")
def realtime_messages():
    if request.environ.get('wsgi.websocket'):
        ws = request.environ['wsgi.websocket']
        initialData = ws.receive()
        initialData = json.loads(initialData)
        print("initialdata: " + str(initialData))
        ws.close()
    return ""
'''


@run_with_reloader
def run_server():
    app.debug = True
    http_server = WSGIServer(('', 5000), app, handler_class=WebSocketHandler)
    http_server.serve_forever()


if __name__ == '__main__':
    run_server()
