# all the imports
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


@app.route('/get-user-data-by-token/<token>', methods=['GET'])
def get_user_data_by_token(token):
    email = logged_in_users.get(token)
    if email is None:
        return jsonify({"success": False, "message": "Token doesn't exists."})
    else:
        data = database_helper.get_user_data(email)
        return jsonify({"success": True, "message": "Token exists.", "data": data})


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
    return str(database_helper.get_all_users())


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

'''
@app.route('/add', methods=['POST'])
def add_entry():
    if not session.get('logged_in'):
        abort(401)
    g.db.execute('insert into entries (title, text) values (?, ?)',
                 [request.form['title'], request.form['text']])
    g.db.commit()
    flash('New entry was successfully posted')
    return redirect(url_for('show_entries'))


@app.route('/login', methods=['GET', 'POST'])
def login():
    error = None
    if request.method == 'POST':
        if request.form['username'] != app.config['USERNAME']:
            error = 'Invalid username'
        elif request.form['password'] != app.config['PASSWORD']:
            error = 'Invalid password'
        else:
            session['logged_in'] = True
            flash('You were logged in')
            return redirect(url_for('show_entries'))
    return render_template('login.html', error=error, logged_in_users=logged_in_users)
'''


@app.route('/logout')
def logout():
    token = session['token']
    session.pop('token', None)
    del logged_in_users[token]
    return redirect(url_for('show_users'))


'''
@app.before_request
def before_request():
    g.db = connect_db()


@app.teardown_request
def teardown_request(exception):
    db = getattr(g, 'db', None)
    if db is not None:
        db.close()
'''

if __name__ == '__main__':
    app.run()
