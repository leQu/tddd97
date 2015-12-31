# all the imports
import sqlite3
import uuid

from flask import Flask, request, session, g, redirect, url_for, \
    abort, render_template, flash
from contextlib import closing

# configuration
DATABASE = '/tmp/flaskr.db'
DEBUG = True
SECRET_KEY = 'development key'
USERNAME = 'admin'
PASSWORD = 'default'

# create our little application :)
app = Flask(__name__)
app.config.from_object(__name__)

app.config.from_envvar('FLASKR_SETTINGS', silent=True)

logged_in_users = {}


def connect_db():
    return sqlite3.connect(app.config['DATABASE'])


def init_db():
    with closing(connect_db()) as db:
        with app.open_resource('schema.sql', mode='r') as f:
            db.cursor().executescript(f.read())
        db.commit()


@app.route('/', methods=['GET'])
def start():
    return redirect('static/client.html')


@app.route('/add-user', methods=['POST'])
def add_user():
    email = request.form['email']
    password = request.form['password']
    firstname = request.form['firstname']
    familyname = request.form['familyname']
    gender = request.form['gender']
    city = request.form['city']
    country = request.form['country']
    message = g.db.execute('insert into users (email, password, firstname, familyname, gender, city, country)'
                           'values (?, ?, ?, ?, ?, ?, ?)',
                           [email, password, firstname, familyname, gender, city, country])
    g.db.commit()
    flash('A new user was created successfully')
    return message


@app.route('/users', methods=['GET'])
def show_users():
    cur = g.db.execute('select email, firstname, familyname, gender, city, country '
                       'from users order by id desc')
    users = [dict(
            email=row[0],
            firstname=row[1],
            familyname=row[2],
            gender=row[3],
            city=row[4],
            country=row[5]
    ) for row in cur.fetchall()]

    return str(users)


@app.route('/signin', methods=['POST'])
def sign_in():
    email = request.form['username']
    password = request.form['password']
    cur = g.db.execute('select password, email from users where email=? and password=?',
                       (email, password))
    row = cur.fetchone()
    # Creates a new random token in string format
    if row is None:
        flash("Wrong username or password!")
        return redirect(url_for('login'))
    else:
        token = str(uuid.uuid4())
        logged_in_users[token] = email
        session['token'] = token
        flash("Logged in!")
    return redirect(url_for('show_users'))


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


@app.route('/logout')
def logout():
    token = session['token']
    session.pop('token', None)
    del logged_in_users[token]
    flash('You were logged out')
    return redirect(url_for('show_users'))


@app.before_request
def before_request():
    g.db = connect_db()


@app.teardown_request
def teardown_request(exception):
    db = getattr(g, 'db', None)
    if db is not None:
        db.close()


if __name__ == '__main__':
    app.run()
