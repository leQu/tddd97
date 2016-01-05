import uuid
import database_helper
from flask import Flask, request, session, g, redirect, url_for, \
    abort, render_template, flash, jsonify

# from contextlib import closing

# configuration
'''
DATABASE = '/tmp/flaskr.db'
DEBUG = True
SECRET_KEY = 'development key'
USERNAME = 'admin'
PASSWORD = 'default'
'''
# create our little application :)
app = Flask(__name__)
app.config.from_object(__name__)

app.config.from_envvar('FLASKR_SETTINGS', silent=True)

logged_in_users = {}

'''
def connect_db():
    return sqlite3.connect(app.config['DATABASE'])


def init_db():
    with closing(connect_db()) as db:
        with app.open_resource('schema.sql', mode='r') as f:
            db.cursor().executescript(f.read())
        db.commit()
'''


@app.route('/', methods=['GET'])
def start():
    return redirect('static/client.html')


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


@app.route('/get-user-messages-by-email/<token>/<email>', methods=['GET'])
def get_user_messages_by_email(token, email):
    messages = database_helper.get_user_messages(email)
    if token not in logged_in_users:
        return jsonify({"success": False, "message": "You must login to access this data."})
    elif not messages:
        return jsonify({"success": False, "message": "No messages so far."})
    else:
        return jsonify({"success": True, "message": "Email exists.", "data": messages})


@app.route('/add-user', methods=['POST'])
def add_user():
    email = request.form['email']
    password = request.form['password']
    firstname = request.form['firstname']
    familyname = request.form['familyname']
    gender = request.form['gender']
    city = request.form['city']
    country = request.form['country']
    message = database_helper.add_user(email, password, firstname, familyname, gender, city, country)
    return str(message)


@app.route('/add-message', methods=['POST'])
def add_message():
    message = request.form['message']
    token = request.form['token']
    to_user = request.form['email']
    if token in logged_in_users:
        from_user = logged_in_users[token]
        message = database_helper.add_message(message, from_user, to_user)
        return jsonify({"success": True, "message": message})
    else:
        return jsonify({"success": False, "message": "You must log in to post message."})


@app.route('/temp', methods=['GET'])
def temp():
    message = database_helper.add_message("Test message 23", "hej@hej.hej", "hej@hej.hej")
    return str(message)


@app.route('/users', methods=['GET'])
def show_users():
    return jsonify({"data": database_helper.get_all_users()})


@app.route('/messages', methods=['GET'])
def show_messages():
    return jsonify({"data": database_helper.get_all_messages()})


@app.route('/get-user-data-temp', methods=['GET'])
def get_user_data_temp():
    data = database_helper.get_user_data("hej@hej.hej")
    return jsonify({"success": True, "message": "Temp.", "data": data})


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
        del logged_in_users[token]
        return jsonify({"success": True, "message": "Successfully signed out."})
    else:
        return jsonify({"success": False, "message": "Already sign out."})


@app.route('/logged-in-users', methods=['GET'])
def show_logged_in_users():
    return str(logged_in_users)


if __name__ == '__main__':
    app.run()
