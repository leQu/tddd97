from gevent.pywsgi import WSGIServer
from werkzeug.serving import run_with_reloader
from geventwebsocket.handler import WebSocketHandler
from geventwebsocket import WebSocketServer, WebSocketError
from flask import Flask, request, session, g, redirect, url_for, \
    abort, render_template, flash, jsonify
import uuid
import sqlite3
import database_helper
import json

app = Flask(__name__)

logged_in_users = {}
current_sockets = {}


@app.route('/')
def index():
    return redirect('static/client.html')


@app.route('/socket-connect')
def socket_connect():
    if request.environ.get("wsgi.websocket"):
        ws = request.environ["wsgi.websocket"]
        while True:
            try:
                message = ws.receive()
                message = json.loads(message)

                # when login, the socket + email is saved
                if "email" == message["type"]:
                    email = message["data"]
                    if email in current_sockets:
                        data = {'type': 'logout'}
                        current_sockets[email].send(json.dumps(data))
                    current_sockets[email] = ws

                # when stats update is requested
                elif "stats" == message["type"]:
                    email = logged_in_users.get(message["token"])
                    data = {
                        'type': 'stats',
                        'messages': len(database_helper.get_user_messages(email)),
                        'users': len(logged_in_users),
                        'pageviews': database_helper.get_user_page_views(email)
                    }
                    ws.send(json.dumps(data))

            except WebSocketError:
                break


@app.route('/test', methods=['GET'])
def test():
    return redirect('static/temp.html')


@app.route('/change-password', methods=['POST'])
def change_password():
    token = request.form['token']
    new_password = request.form['new_password']
    old_password = request.form['old_password']
    if token not in logged_in_users:
        return jsonify({"success": False, "message": "You must be logged in to change password."})
    else:
        email = logged_in_users[token]
        is_valid = database_helper.is_valid_login(email, old_password)
        if not is_valid:
            return jsonify({"success": False, "message": "Old password is not correct."})
        else:
            database_helper.update_password(email, new_password)
            return jsonify({"success": True, "message": "Password changed successfully."})


@app.route('/get-user-data-by-token/<token>', methods=['GET'])
def get_user_data_by_token(token):
    email = logged_in_users.get(token)
    if email is None:
        return jsonify({"success": False, "message": "Token doesn't exists."})
    else:
        data = database_helper.get_user_data(email)
        return jsonify({"success": True, "message": "Token exists.", "data": data})


@app.route('/get-user-data-by-email/<token>/<email>', methods=['GET'])
def get_user_data_by_email(token, email):
    data = database_helper.get_user_data(email)
    if token not in logged_in_users:
        return jsonify({"success": False, "message": "You must login to access this data."})
    elif not data:
        return jsonify({"success": False, "message": "Email doesn't exists."})
    else:
        return jsonify({"success": True, "message": "Email exists.", "data": data})


@app.route('/increase-page-views', methods=['POST'])
def increase_page_views():
    email = request.form['email']
    token = request.form['token']
    if token in logged_in_users:
        try:
            database_helper.increase_page_visits(email)
            return jsonify({"success": True, "message": "Visits increased"})
        except sqlite3.Error:
            return jsonify({"success": False, "message": "Could not increase visits"})
    else:
        return jsonify({"success": False, "message": "You must login to access this data."})


@app.route('/get-user-messages-by-email/<token>/<email>', methods=['GET'])
def get_user_messages_by_email(token, email):
    messages = database_helper.get_user_messages(email)
    if token not in logged_in_users:
        return jsonify({"success": False, "message": "You must login to access this data."})
    elif not messages:
        return jsonify({"success": False, "message": "No messages so far."})
    else:
        return jsonify({"success": True, "message": "Email exists.", "data": messages})


@app.route('/get-user-messages-by-token/<token>', methods=['GET'])
def get_user_messages_by_token(token):
    if token not in logged_in_users:
        return jsonify({"success": False, "message": "You must login to access this data."})
    else:
        email = logged_in_users[token]
        messages = database_helper.get_user_messages(email)
        if not messages:
            return jsonify({"success": True, "message": "No messages so far."})
        else:
            return jsonify({"success": True, "message": "Messages exists.", "data": messages})


@app.route('/add-user', methods=['POST'])
def add_user():
    email = request.form['email']
    password = request.form['password']
    firstname = request.form['firstname']
    familyname = request.form['familyname']
    gender = request.form['gender']
    city = request.form['city']
    country = request.form['country']
    try:
        database_helper.add_user(email, password, firstname, familyname, gender, city, country)
        return jsonify({"success": True, "message": "User created successfully."})
    except sqlite3.Error:
        return jsonify({"success": False, "message": "Could not add user. Email already exists?"})


@app.route('/add-message', methods=['POST'])
def add_message():
    message = request.form['message']
    token = request.form['token']
    to_user = request.form['email']
    if token in logged_in_users:
        from_user = logged_in_users[token]
        try:
            database_helper.add_message(message, from_user, to_user)
            return jsonify({"success": True, "message": "Successfully added user."})
        except sqlite3.Error:
            return jsonify({"success": False, "message": "Database error. Could not post message."})
    else:
        return jsonify({"success": False, "message": "You must log in to post message."})


@app.route('/sign-in', methods=['POST'])
def sign_in():
    email = request.form['username']
    password = request.form['password']
    is_valid = database_helper.is_valid_login(email, password)
    if is_valid:
        token = str(uuid.uuid4())
        logged_in_users[token] = email
        return jsonify({"success": True, "message": "Successfully signed in.", "data": token})
    else:
        return jsonify({"success": False, "message": "Wrong username or password."})


@app.route('/sign-out', methods=['POST'])
def sign_out():
    token = request.form['token']
    if token in logged_in_users:
        email = logged_in_users[token]
        del current_sockets[email]
        del logged_in_users[token]
        return jsonify({"success": True, "message": "Successfully signed out."})
    else:
        return jsonify({"success": False, "message": "Already sign out."})


@app.route('/logged-in-users', methods=['GET'])
def show_logged_in_users():
    return str(logged_in_users)


@app.route('/temp', methods=['GET'])
def temp():
    database_helper.temp()
    try:
        database_helper.add_user("email@email.email", "x", "x", "x", "x", "x", "x")
        return "success!"
    except sqlite3.Error:
        return "error!"


@app.route('/is-logged-in/<token>', methods=['GET'])
def is_logged_in(token):
    if token in logged_in_users:
        return jsonify({"success": True, "message": True})
    else:
        return jsonify({"success": True, "message": False})


@app.route('/users', methods=['GET'])
def show_users():
    return jsonify({"data": database_helper.get_all_users()})


@app.route('/messages', methods=['GET'])
def show_messages():
    return jsonify({"data": database_helper.get_all_messages()})


@run_with_reloader
def run_server():
    app.debug = True
    http_server = WSGIServer(('', 5000), app, handler_class=WebSocketHandler)
    http_server.serve_forever()


if __name__ == "__main__":
    # init_db(app)
    run_server()
