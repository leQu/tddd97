import sys
import uuid
import database_helper
from flask import Flask, request, session, g, redirect, url_for, \
    abort, render_template, flash, jsonify
import json
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


@app.route('/users', methods=['GET'])
def show_users():
    return jsonify({"data": database_helper.get_all_users()})


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


@app.route('/logged-in-users', methods=['GET'])
def show_logged_in_users():
    return str(logged_in_users)


@app.route('/logout')
def logout():
    token = session['token']
    session.pop('token', None)
    del logged_in_users[token]
    return redirect(url_for('show_users'))


if __name__ == '__main__':
    app.run()
